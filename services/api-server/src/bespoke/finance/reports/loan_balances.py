"""
  This file handles calculating a customer's balances for all the loans
  that they have, and their account level fees.
"""

"""
  Inputs:
	Contract:
	Repayments:

	Advances:
	Late Fees:

	Balances:
	Billing reports:
"""
import datetime
import decimal
import logging
from datetime import timedelta
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.db import db_constants, models
from bespoke.db.db_constants import LoanStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import contract_util, number_util
from bespoke.finance.fetchers import per_customer_fetcher
from bespoke.finance.loans import fee_util, loan_calculator
from bespoke.finance.loans.fee_util import FeeDict
from bespoke.finance.loans.loan_calculator import LoanUpdateDict, LoanUpdateDebugInfoDict
from bespoke.finance.payments import payment_util
from bespoke.finance.types import finance_types, per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

SummaryUpdateDict = TypedDict('SummaryUpdateDict', {
	'product_type': str,
	'total_limit': float,
	'adjusted_total_limit': float,
	'total_outstanding_principal': float,
	'total_outstanding_principal_for_interest': float,
	'total_outstanding_interest': float,
	'total_outstanding_fees': float,
	'total_principal_in_requested_state': float,
	'total_amount_to_pay_interest_on': float,
	'total_interest_accrued_today': float,
	'total_interest_paid_adjustment_today': float,
	'total_fees_paid_adjustment_today': float,
	'available_limit': float,
	'minimum_monthly_payload': FeeDict,
	'account_level_balance_payload': finance_types.AccountBalanceDict,
	'day_volume_threshold_met': datetime.date
})

EbbaApplicationUpdateDict = TypedDict('EbbaApplicationUpdateDict', {
	'id': str,
	'calculated_borrowing_base': float,
})

POUpdateDict = TypedDict('POUpdateDict', {
	'amount_funded': float
})

PurchaseOrdersUpdateDict = TypedDict('PurchaseOrdersUpdateDict', {
	'purchase_order_id_to_update': Dict[str, POUpdateDict]
})

CustomerUpdateDict = TypedDict('CustomerUpdateDict', {
	'today': datetime.date,
	'loan_updates': List[LoanUpdateDict],
	'active_ebba_application_update': EbbaApplicationUpdateDict,
	'purchase_orders_update': PurchaseOrdersUpdateDict,
	'summary_update': SummaryUpdateDict,
	'loan_id_to_debug_info': Dict[str, LoanUpdateDebugInfoDict]
})


def _get_active_ebba_application_update(
	contract_helper: contract_util.ContractHelper,
	ebba_application: models.EbbaApplicationDict,
	today: datetime.date) -> Tuple[EbbaApplicationUpdateDict, errors.Error]:

	cur_contract, err = contract_helper.get_contract(today)
	if err:
		return None, err

	product_type, err = cur_contract.get_product_type()
	if err:
		return None, err

	# If we're not working with a LINE_OF_CREDIT contract, we just return None
	# for the update dict without an error
	if product_type != ProductType.LINE_OF_CREDIT:
		return None, None

	cur_contract, err = cur_contract.for_product_type()
	if err:
		return None, err

	cur_contract = cast(contract_util.LOCContract, cur_contract)

	# If we don't have an active borrowing base, return 0.0.
	if not ebba_application:
		return EbbaApplicationUpdateDict(
			id=None,
			calculated_borrowing_base=0.0,
		), None
	else:
		calculated_borrowing_base, err = cur_contract.compute_borrowing_base(ebba_application)
		if err:
			logging.error(
				f"Failed computing borrowing base for contract '{cur_contract.contract_id}' and ebba application '{ebba_application['id']}'")
			return None, err

		return EbbaApplicationUpdateDict(
			id=ebba_application['id'],
			calculated_borrowing_base=number_util.round_currency(calculated_borrowing_base),
		), None

def _get_account_level_balance(customer_info: per_customer_types.CustomerFinancials) -> Tuple[finance_types.AccountBalanceDict, errors.Error]:
	fees_total = 0.0
	credits_total = 0.0

	for aug_tx in customer_info['financials']['augmented_transactions']:
		tx = aug_tx['transaction']
		if tx['loan_id'] is not None:
			continue

		tx_type = tx['type']
		# Account level transactions have no loan_id associated with them
		if tx_type in db_constants.FEE_TYPES:
			fees_total += tx['amount']
		elif tx_type == db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE:
			fees_total -= tx['amount']
		elif tx_type in db_constants.CREDIT_TO_USER_TYPES:
			credits_total += tx['amount']
		elif tx_type == db_constants.PaymentType.USER_CREDIT_TO_ACCOUNT_FEE:
			fees_total -= tx['amount']
			credits_total -= tx['amount']
		elif tx_type == db_constants.PaymentType.PAYOUT_USER_CREDIT_TO_CUSTOMER:
			credits_total -= tx['amount']
		else:
			return None, errors.Error(
				f'Transaction {tx["id"]} has a type "{tx_type}" which is neither a fee nor a credit to a user. This implies an unregistered or incorrect transaction type')

	return finance_types.AccountBalanceDict(
		fees_total=number_util.round_currency(fees_total),
		credits_total=number_util.round_currency(credits_total)
	), None

def _get_summary_update(
	customer_info: per_customer_types.CustomerFinancials,
	contract_helper: contract_util.ContractHelper,
	loan_updates: List[LoanUpdateDict],
	active_ebba_application_update: EbbaApplicationUpdateDict,
	fee_accumulator: fee_util.FeeAccumulator,
	today: datetime.date
	) -> Tuple[SummaryUpdateDict, errors.Error]:
	cur_contract, err = contract_helper.get_contract(today)
	if err:
		return None, err

	product_type, err = cur_contract.get_product_type()
	if err:
		return None, err

	maximum_principal_limit, err = cur_contract.get_maximum_principal_limit()
	if err:
		return None, err

	adjusted_total_limit = maximum_principal_limit

	# The adjusted total limit for Line of Credit customers is the
	# minimum of contract maximum limit and calculated borrowing base.
	include_borrowing_base_for_limits, _ = cur_contract.get_include_borrowing_base_for_limits()

	if product_type == ProductType.LINE_OF_CREDIT and include_borrowing_base_for_limits:
		adjusted_total_limit = min(
			maximum_principal_limit,
			active_ebba_application_update['calculated_borrowing_base'] if active_ebba_application_update else 0.0,
		)
	else:
		adjusted_total_limit = maximum_principal_limit

	total_outstanding_principal = 0.0
	total_outstanding_principal_for_interest = 0.0
	total_outstanding_interest = 0.0
	total_outstanding_fees = 0.0
	total_amount_to_pay_interest_on = 0.0
	total_interest_accrued_today = 0.0
	total_interest_paid_adjustment_today = 0.0
	total_fees_paid_adjustment_today = 0.0

	for l in loan_updates:
		total_outstanding_principal += l['outstanding_principal']
		total_outstanding_principal_for_interest += l['outstanding_principal_for_interest']
		total_outstanding_interest += l['outstanding_interest']
		total_outstanding_fees += l['outstanding_fees']
		total_amount_to_pay_interest_on += l['amount_to_pay_interest_on']
		total_interest_accrued_today += l['interest_accrued_today']
		total_interest_paid_adjustment_today += l['interest_paid_daily_adjustment']
		total_fees_paid_adjustment_today += l['fees_paid_daily_adjustment']

	minimum_monthly_payload, err = fee_util.get_cur_minimum_fees(contract_helper, today, fee_accumulator)
	if err:
		return None, err

	account_level_balance, err = _get_account_level_balance(customer_info)
	if err:
		return None, err

	return SummaryUpdateDict(
		product_type=product_type,
		total_limit=maximum_principal_limit,
		adjusted_total_limit=adjusted_total_limit,
		total_outstanding_principal=total_outstanding_principal,
		total_outstanding_principal_for_interest=total_outstanding_principal_for_interest,
		total_outstanding_interest=total_outstanding_interest,
		total_outstanding_fees=total_outstanding_fees,
		total_principal_in_requested_state=0.0,
		total_amount_to_pay_interest_on=total_amount_to_pay_interest_on,
		total_interest_accrued_today=total_interest_accrued_today,
		total_interest_paid_adjustment_today=total_interest_paid_adjustment_today,
		total_fees_paid_adjustment_today=total_fees_paid_adjustment_today,
		available_limit=max(0.0, adjusted_total_limit - total_outstanding_principal),
		minimum_monthly_payload=minimum_monthly_payload,
		account_level_balance_payload=account_level_balance,
		day_volume_threshold_met=None
	), None

class CustomerBalance(object):
	"""
		Object to help us calculate what the customer's balance should be.
	"""

	def __init__(self, company_dict: models.CompanyDict, session_maker: Callable) -> None:
		self._session_maker = session_maker
		self._company_name = company_dict['name']
		self._company_id = company_dict['id']

	def _get_customer_update(
		self, 
		today: datetime.date, 
		customer_info: per_customer_types.CustomerFinancials,
		include_debug_info: bool,
		include_frozen: bool,
		is_past_date: bool) -> Tuple[CustomerUpdateDict, errors.Error]:

		financials = customer_info['financials']

		if not financials['contracts']:
			return None, None

		contract_helper, err = contract_util.ContractHelper.build(
			self._company_id, financials['contracts'])
		if err:
			raise err

		contract, err = contract_helper.get_contract(today)
		if err and is_past_date:
			# If we dont have a contract for a date in the past, that is OK,
			# because we technically only need today's report_date to succeed
			return None, None

		if err:
			# However if its a current day, then we really cant calculate the customer update for today
			return None, err

		# For now, we just assume the start date is today.
		start_date = today
		fee_accumulator = fee_util.FeeAccumulator()
		fee_accumulator.init_with_date_range(start_date, today)

		all_errors = []
		loan_update_dicts = []
		total_principal_in_requested_state = 0.0

		# What day do you cross the threshold, and on that day you cross the threshold,
		# how much money stays below the threshold
		loan_id_to_transactions = {}
		threshold_accumulator = loan_calculator.ThresholdAccumulator(contract_helper)

		for loan in financials['loans']:
			transactions_for_loan = loan_calculator.get_transactions_for_loan(
				loan['id'], financials['augmented_transactions'], accumulator=threshold_accumulator)

			if loan['status'] == LoanStatusEnum.APPROVAL_REQUESTED:
				total_principal_in_requested_state += loan['amount']

			if not loan['origination_date']:
				# If the loan hasn't been originated yet, nothing to calculate
				continue

			if not loan['adjusted_maturity_date']:
				logging.error('Data issue, adjusted_maturity_date missing for loan {}'.format(loan['id']))
				continue

			loan_id_to_transactions[loan['id']] = transactions_for_loan

		artifact_id_to_invoice = {}
		for invoice in financials['invoices']:
			artifact_id_to_invoice[invoice['id']] = invoice

		# Calculate a summary for the factoring fee threshold
		threshold_info, err = threshold_accumulator.compute_threshold_info(
			report_date=today)
		if err:
			return None, err

		purchase_order_id_to_update: Dict[str, POUpdateDict] = {}
		for purchase_order in financials['purchase_orders']:
			purchase_order_id_to_update[purchase_order['id']] = POUpdateDict(
				amount_funded=0.0
			)

		loan_id_to_debug_info = {}
		for loan in financials['loans']:
			if not loan['origination_date']:
				# If the loan hasn't been originated yet, nothing to calculate
				continue

			if not loan['adjusted_maturity_date']:
				logging.error('Data issue, adjusted_maturity_date missing for loan {}'.format(loan['id']))
				continue

			transactions_for_loan = loan_id_to_transactions[loan['id']]
			invoice = artifact_id_to_invoice.get(loan['artifact_id'])
			po_update = purchase_order_id_to_update.get(loan['artifact_id'])
			if po_update and loan['funded_at']:
				# If the loan is funded and we found its corresponding purchase order
				# then update details about the Purchase Order
				po_update['amount_funded'] += loan['amount']

			if not include_frozen and loan['is_frozen']:
				# We want to calculate details like how much a loan contributes to whether a 
				# Purchase Order is fully funded, but we don't want to run any balances for it
				# so we skip it after accounting for its contribution to Purchase Orders but
				# before calculating any balances
				continue

			calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
			calculate_result, errors_list = calculator.calculate_loan_balance(
				threshold_info,
				loan,
				invoice,
				transactions_for_loan,
				today,
				should_round_output=False,
				include_debug_info=include_debug_info
			)
			if errors_list:
				logging.error('Got these errors associated with loan {}'.format(loan['id']))
				for err in errors_list:
					logging.error(err.msg)

				all_errors.extend(errors_list)
			else:
				loan_update_dict = calculate_result['loan_update']
				loan_update_dicts.append(loan_update_dict)
				loan_id_to_debug_info[loan['id']] = calculate_result['debug_info'] 

		if all_errors:
			raise errors.Error(
				'Will not proceed with updates because there was more than 1 error during loan balance updating',
				details={'errors': all_errors}
			)

		ebba_application_update, err = _get_active_ebba_application_update(
			contract_helper,
			financials.get('active_ebba_application'),
			today)
		if err:
			raise err

		summary_update, err = _get_summary_update(
			customer_info,
			contract_helper,
			loan_update_dicts,
			ebba_application_update,
			fee_accumulator,
			today,
		)

		if err:
			raise err

		summary_update['total_principal_in_requested_state'] = total_principal_in_requested_state
		summary_update['day_volume_threshold_met'] = threshold_info['day_threshold_met']

		customer_update = CustomerUpdateDict(
			today=today,
			loan_updates=loan_update_dicts,
			active_ebba_application_update=ebba_application_update,
			purchase_orders_update=PurchaseOrdersUpdateDict(
				purchase_order_id_to_update=purchase_order_id_to_update
			),
			summary_update=summary_update,
			loan_id_to_debug_info=loan_id_to_debug_info
		)
		return customer_update, None

	@errors.return_error_tuple
	def update(
		self,
		start_date_for_storing_updates: datetime.date,
		today: datetime.date,
		include_debug_info: bool,
		is_past_date_default_val: bool,
		include_frozen: bool = False,
	) -> Tuple[Dict[datetime.date, CustomerUpdateDict], errors.Error]:
		"""
		Returns None if company does not have any contracts.
		"""
		# Get your contracts and loans
		fetcher = per_customer_fetcher.Fetcher(
			per_customer_types.CompanyInfoDict(
				id=self._company_id,
				name=self._company_name
			),
			self._session_maker,
			ignore_deleted=True,
		)
		_, err = fetcher.fetch(today)
		if err:
			raise err

		customer_info = fetcher.get_financials()

		customer_update, err = self._get_customer_update(
			today, customer_info, include_debug_info, include_frozen, is_past_date=is_past_date_default_val)
		if err:
			return None, err

		date_to_customer_update = {}
		date_to_customer_update[today] = customer_update

		# Calculate the customer update for the remaining days in the past
		cur_date = start_date_for_storing_updates
		while cur_date < today:
			customer_update, err = self._get_customer_update(
				cur_date, customer_info, include_debug_info, include_frozen, is_past_date=True)
			if err:
				return None, err
			date_to_customer_update[cur_date] = customer_update

			cur_date = cur_date + timedelta(days=1)

		return date_to_customer_update, None

	def _update_todays_info(self, customer_update: CustomerUpdateDict, session: Session) -> None:
		loan_ids = []
		loan_id_to_update = {}
		for loan_update in customer_update['loan_updates']:
			loan_id = loan_update['loan_id']
			loan_id_to_update[loan_id] = loan_update
			loan_ids.append(loan_id)

		loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())

		if not loans:
			loans = []

		loan_report_ids = [loan.loan_report_id for loan in loans]
		loan_reports = cast(
			List[models.LoanReport],
			session.query(models.LoanReport).filter(
				models.LoanReport.id.in_(loan_report_ids)
			).all())

		loan_report_id_to_loan_report = dict({})
		for loan_report in loan_reports:
			loan_report_id_to_loan_report[str(loan_report.id)] = loan_report

		for loan in loans:
			cur_loan_update = loan_id_to_update[str(loan.id)]
			loan.outstanding_principal_balance = decimal.Decimal(number_util.round_currency(cur_loan_update['outstanding_principal']))
			loan.outstanding_interest = decimal.Decimal(number_util.round_currency(cur_loan_update['outstanding_interest']))
			loan.outstanding_fees = decimal.Decimal(number_util.round_currency(cur_loan_update['outstanding_fees']))

			if cur_loan_update['should_close_loan']:
				payment_util.close_loan(loan)

			loan_report = loan_report_id_to_loan_report.get(str(loan.id), None)
			if not loan_report:
				loan_report = models.LoanReport()
				session.add(loan_report)
				session.flush()
				loan.loan_report_id = loan_report.id

			loan_report.repayment_date = cur_loan_update['repayment_date']
			loan_report.financing_period = cur_loan_update['financing_period']
			loan_report.financing_day_limit = cur_loan_update['financing_day_limit']
			loan_report.total_principal_paid = decimal.Decimal(number_util.round_currency(cur_loan_update['total_principal_paid']))
			loan_report.total_interest_paid = decimal.Decimal(number_util.round_currency(cur_loan_update['total_interest_paid']))
			loan_report.total_fees_paid = decimal.Decimal(number_util.round_currency(cur_loan_update['total_fees_paid']))

		purchase_order_id_to_update = customer_update['purchase_orders_update']['purchase_order_id_to_update']
		purchase_order_ids = list(purchase_order_id_to_update.keys())
		purchase_orders = cast(
			List[models.PurchaseOrder],
			session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.id.in_(purchase_order_ids)
			).all())

		if not purchase_orders:
			purchase_orders = []

		for purchase_order in purchase_orders:
			po_update = purchase_order_id_to_update[str(purchase_order.id)]
			purchase_order.amount_funded = decimal.Decimal(po_update['amount_funded'])

		# If there is an active ebba application, update its calculated borrowing
		# base to reflect the value as a product of the current contract. These are
		# first computed in the UI and stored on the server. However, if the
		# contract changes, then the calculated value we've stored may no
		# longer reflect the terms of the company's contract.
		active_ebba_application_update = customer_update.get('active_ebba_application_update')
		if active_ebba_application_update and active_ebba_application_update['id'] is not None:
			app = session.query(models.EbbaApplication).get(active_ebba_application_update['id'])
			app.calculated_borrowing_base = decimal.Decimal(active_ebba_application_update['calculated_borrowing_base'])

	@errors.return_error_tuple
	def write(self, customer_update: CustomerUpdateDict, is_todays_update: bool) -> Tuple[bool, errors.Error]:

		err_details = {
			'customer_name': self._company_name,
			'method': 'CustomerBalance.write'
		}

		with session_scope(self._session_maker) as session:
			if is_todays_update:
				self._update_todays_info(customer_update, session)

			financial_summary = cast(
				models.FinancialSummary,
				session.query(models.FinancialSummary).filter(
					models.FinancialSummary.company_id == self._company_id)
				.filter(models.FinancialSummary.date == customer_update['today'].isoformat()).first())

			should_add_summary = not financial_summary
			if should_add_summary:
				financial_summary = models.FinancialSummary(
					company_id=self._company_id
				)

			summary_update = customer_update['summary_update']
			financial_summary.date = customer_update['today']
			financial_summary.total_limit = decimal.Decimal(number_util.round_currency(summary_update['total_limit']))
			financial_summary.adjusted_total_limit = decimal.Decimal(number_util.round_currency(summary_update['adjusted_total_limit']))
			financial_summary.total_outstanding_principal = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_principal']))
			financial_summary.total_outstanding_principal_for_interest = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_principal_for_interest']))
			financial_summary.total_outstanding_interest = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_interest']))
			financial_summary.total_outstanding_fees = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_fees']))
			financial_summary.total_principal_in_requested_state = decimal.Decimal(number_util.round_currency(summary_update['total_principal_in_requested_state']))
			financial_summary.total_amount_to_pay_interest_on = decimal.Decimal(number_util.round_currency(summary_update['total_amount_to_pay_interest_on']))
			financial_summary.interest_accrued_today = decimal.Decimal(number_util.round_currency(summary_update['total_interest_accrued_today']))
			financial_summary.total_interest_paid_adjustment_today = decimal.Decimal(number_util.round_currency(summary_update['total_interest_paid_adjustment_today']))
			financial_summary.total_fees_paid_adjustment_today = decimal.Decimal(number_util.round_currency(summary_update['total_fees_paid_adjustment_today']))
			financial_summary.available_limit = decimal.Decimal(number_util.round_currency(summary_update['available_limit']))
			financial_summary.minimum_monthly_payload = cast(Dict, summary_update['minimum_monthly_payload'])
			financial_summary.account_level_balance_payload = cast(Dict, summary_update['account_level_balance_payload'])
			financial_summary.day_volume_threshold_met = summary_update['day_volume_threshold_met']
			financial_summary.product_type = summary_update['product_type']

			if should_add_summary:
				session.add(financial_summary)

			# The balance was updated so we no longer need to "recompute" it
			financial_summary.needs_recompute = False

			return True, None
