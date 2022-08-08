import datetime
import decimal
import logging

from mypy_extensions import TypedDict
from typing import Callable, Tuple, List, Dict, cast
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.models import MinimumInterestInfoDict
from bespoke.db.db_constants import MinimumAmountDuration, TransactionSubType
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util, repayment_util
from bespoke.finance.types import payment_types

MonthEndPerCompanyRespInfo = TypedDict('MonthEndPerCompanyRespInfo', {
	'fee_info': models.MinimumInterestInfoDict,
	'fee_amount': float,
	'total_outstanding_interest': float,
	'company': models.CompanyDict
})

AllMonthlyDueRespDict = TypedDict('AllMonthlyDueRespDict', {
	'company_due_to_financial_info': Dict[str, MonthEndPerCompanyRespInfo]
})

PerCompanyRespInfo = TypedDict('PerCompanyRespInfo', {
	'fee_info': models.MinimumInterestInfoDict,
	'company': models.CompanyDict
})

AllMonthlyMinimumDueRespDict = TypedDict('AllMonthlyMinimumDueRespDict', {
	'company_due_to_financial_info': Dict[str, PerCompanyRespInfo]
})

def _is_in_same_month(d1: datetime.date, d2: datetime.date) -> bool:
	return d1.year == d2.year and d1.month == d2.month

def _should_pay_this_month(fee_payload: models.MinimumInterestInfoDict, cur_date: datetime.date) -> bool:
	if 'prorated_info' not in fee_payload or fee_payload['prorated_info'] is None:
		return False

	day_to_pay = fee_payload['prorated_info']['day_to_pay']
	date_to_pay = date_util.load_date_str(day_to_pay)

	if fee_payload['duration'] == MinimumAmountDuration.MONTHLY:
		return cur_date == date_to_pay
	elif fee_payload['duration'] == MinimumAmountDuration.QUARTERLY:
		return cur_date == date_to_pay
	elif fee_payload['duration'] == MinimumAmountDuration.ANNUALLY:
		return _is_in_same_month(cur_date, date_to_pay)
	else:
		raise errors.Error('Unrecognized fee payload duration "{}"'.format(fee_payload['duration']))

def get_all_minimum_interest_fees_due(
	date_str: str,
	session: Session,
) -> Tuple[AllMonthlyMinimumDueRespDict, errors.Error]:
	
	last_day_of_month_date = date_util.get_last_day_of_month_date(date_str)

	company_settings_list = cast(
		List[models.CompanySettings],
		session.query(models.CompanySettings).filter(
			cast(Callable, models.CompanySettings.is_dummy_account.isnot)(True)
		).all())

	real_company_ids = []
	for company_setting in company_settings_list:
		if company_setting.company_id:
			real_company_ids.append(str(company_setting.company_id))

	companies = cast(
		List[models.Company],
		session.query(models.Company).filter(models.Company.id.in_(real_company_ids)).all())

	company_id_to_dict = {}
	company_setting_ids = []
	for company in companies:
		company_id_to_dict[str(company.id)] = company.as_dict()
		if company.company_settings_id:
			company_setting_ids.append(str(company.company_settings_id))

	financial_summaries = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.date == last_day_of_month_date
		).filter(models.FinancialSummary.company_id.in_(real_company_ids)).all())

	if not financial_summaries:
		return None, errors.Error('No financial summaries found for date {}'.format(
			date_util.date_to_str(last_day_of_month_date)))

	company_id_to_financial_info = {}

	for financial_summary in financial_summaries:
		cur_company_id = str(financial_summary.company_id)

		if not financial_summary.minimum_monthly_payload:
			continue

		minimum_monthly_payload = cast(models.MinimumInterestInfoDict, financial_summary.minimum_monthly_payload)

		if not _should_pay_this_month(minimum_monthly_payload, last_day_of_month_date):
			continue

		if number_util.is_currency_zero(minimum_monthly_payload['amount_short']):
			continue

		company_id_to_financial_info[cur_company_id] = PerCompanyRespInfo(
			fee_info=minimum_monthly_payload,
			company=company_id_to_dict[cur_company_id]
		)

	return AllMonthlyMinimumDueRespDict(
		company_due_to_financial_info=company_id_to_financial_info
	), None


def edit_account_level_fee(
	session: Session,
	payment_id: str,
	effective_date: str,
) -> Tuple[bool, errors.Error]:

	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first())
	
	if not payment:
		return None, errors.Error('No payment with the specified payment id')
	
	payment.settlement_date = date_util.load_date_str(effective_date)

	transaction = cast(
		models.Transaction, 
		session.query(models.Transaction).filter(
			models.Transaction.payment_id == payment_id
		).first())

	if not transaction:
		return None, errors.Error('No transaction with the specified payment id')
	
	transaction.effective_date = date_util.load_date_str(effective_date)

	return True, None

def create_minimum_due_fee_for_customers(
	date_str: str,
	minimum_due_resp: AllMonthlyMinimumDueRespDict,
	user_id: str,
	session: Session,
) -> Tuple[bool, errors.Error]:

	if not minimum_due_resp['company_due_to_financial_info']:
		return None, errors.Error('No companies provided to book minimum due fees')

	selected_date = date_util.load_date_str(date_str)
	last_day_of_month_date = date_util.get_last_day_of_month_date(date_str)

	# Find minimum fee payments which were booked this month
	effective_month = selected_date.strftime('%m/%Y')

	booked_minimum_fees = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			models.Payment.type == db_constants.PaymentType.FEE
		).filter(models.Payment.items_covered == {
			'effective_month': effective_month
		}).all())

	company_id_to_fee = {}
	for payment in booked_minimum_fees:
		company_id_to_fee[str(payment.company_id)] = payment

	for customer_id, val_info in minimum_due_resp['company_due_to_financial_info'].items():
		existing_booked_fee = company_id_to_fee.get(customer_id)
		if existing_booked_fee:
			raise errors.Error('Company {} already has a fee booked for {}. Please remove them or undo the booked minimum fee for this time frame'.format(
				customer_id, effective_month))

		fee_dict = val_info['fee_info']
		amount_due = fee_dict['amount_short']
		_ = payment_util.create_and_add_account_level_fee(
			company_id=customer_id,
			subtype=TransactionSubType.MINIMUM_INTEREST_FEE,
			amount=amount_due,
			originating_payment_id=None,
			created_by_user_id=user_id,
			effective_date=last_day_of_month_date,
			session=session,
		)

	return True, None


def get_all_month_end_payments(
	date_str: str,
	session: Session,
) -> Tuple[AllMonthlyDueRespDict, errors.Error]:

	selected_date = date_util.load_date_str(date_str)
	first_day_of_month_date = date_util.get_first_day_of_month_date(date_str)
	last_day_of_month_date = date_util.get_last_day_of_month_date(date_str)

	company_settings_list = cast(
		List[models.CompanySettings],
		session.query(models.CompanySettings).filter(
			cast(Callable, models.CompanySettings.is_dummy_account.isnot)(True)
		).all())

	real_company_ids = []
	for company_setting in company_settings_list:
		if company_setting.company_id:
			real_company_ids.append(str(company_setting.company_id))

	companies = cast(
		List[models.Company],
		session.query(models.Company).filter(models.Company.id.in_(real_company_ids)).all())

	company_id_to_dict = {}
	for company in companies:
		company_id_to_dict[str(company.id)] = company.as_dict()

	financial_summaries = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.date == last_day_of_month_date
		).filter(
			models.FinancialSummary.company_id.in_(real_company_ids)
		).all())

	if not financial_summaries:
		return None, errors.Error('No financial summaries found for date {}'.format(
			date_util.date_to_str(last_day_of_month_date)))

	financial_summaries_begin_of_month = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.date == first_day_of_month_date
		).filter(
			models.FinancialSummary.product_type != db_constants.ProductType.LINE_OF_CREDIT
		).all())

	if not financial_summaries_begin_of_month:
		return None, errors.Error('No financial summaries found at the beginning of month for date {}'.format(
			date_util.date_to_str(first_day_of_month_date)))

	non_loc_companies_at_beginning_of_month = {}
	for fin_summary in financial_summaries_begin_of_month:
		non_loc_companies_at_beginning_of_month[str(fin_summary.company_id)] = True

	company_id_to_financial_info = {}

	effective_month = selected_date.strftime('%m/%Y')

	# Find minimum interest fees which were booked this month
	booked_minimum_fees = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			models.Payment.type == db_constants.PaymentType.FEE
		).filter(models.Payment.items_covered == {
			'effective_month': effective_month
		}).all())

	# Find minimum interest fee waivers which were booked this month
	booked_minimum_fee_waivers = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			models.Payment.type == db_constants.PaymentType.FEE_WAIVER
		).filter(models.Payment.items_covered == {
			'effective_month': effective_month
		}).all())

	company_id_to_fee = {}
	for fee in booked_minimum_fees:
		company_id_to_fee[str(fee.company_id)] = fee

	company_id_to_fee_waiver = {}
	for fee_waiver in booked_minimum_fee_waivers:
		company_id_to_fee_waiver[str(fee_waiver.company_id)] = fee_waiver

	for financial_summary in financial_summaries:
		cur_company_id = str(financial_summary.company_id)
		company_dict = company_id_to_dict[cur_company_id]

		if not financial_summary.minimum_monthly_payload:
			continue

		is_loc_customer = financial_summary.product_type == db_constants.ProductType.LINE_OF_CREDIT

		if is_loc_customer and (cur_company_id in non_loc_companies_at_beginning_of_month):
			logging.info('Skipping company {} from an LOC reverse draft ACH because they werent an LOC customer at the beginning of the month'.format(
				company_dict['name']))
			continue

		minimum_monthly_payload = cast(models.MinimumInterestInfoDict, financial_summary.minimum_monthly_payload)
		fee_amount = float(financial_summary.total_outstanding_interest) if is_loc_customer else 0.0

		booked_fee = company_id_to_fee.get(cur_company_id)
		booked_fee_waiver = company_id_to_fee_waiver.get(cur_company_id)

		amount_after_waiver = (booked_fee.amount if booked_fee else decimal.Decimal(0.0)) - (booked_fee_waiver.amount if booked_fee_waiver else decimal.Decimal(0.0))
		owes_fee = amount_after_waiver > 0

		if owes_fee:
			fee_amount += float(amount_after_waiver)
			minimum_monthly_payload['amount_short'] = float(amount_after_waiver)
		else:
			# Amount short means how much the customer should pay this month.
			# In the quarterly and annual case, they may not owe this minimum fee,
			# so we just present it as 0.0 to the user, and the calculation will
			# run correctly
			minimum_monthly_payload['amount_short'] = 0.0

		if number_util.is_currency_zero(fee_amount):
			continue

		# Total outstanding interest is only a relevant number for LOC customers
		total_outstanding_interest = float(financial_summary.total_outstanding_interest) \
			if is_loc_customer else 0.0

		company_id_to_financial_info[cur_company_id] = MonthEndPerCompanyRespInfo(
			fee_info=minimum_monthly_payload,
			total_outstanding_interest=total_outstanding_interest,
			fee_amount=fee_amount,
			company=company_id_to_dict[cur_company_id]
		)

	return AllMonthlyDueRespDict(
		company_due_to_financial_info=company_id_to_financial_info
	), None

def create_month_end_payments_for_customers(
	date_str: str,
	minimum_due_resp: AllMonthlyDueRespDict,
	user_id: str,
	session: Session,
) -> Tuple[bool, errors.Error]:

	if not minimum_due_resp['company_due_to_financial_info']:
		return None, errors.Error('No companies provided to book minimum due fees')

	requested_date = date_util.load_date_str(date_str)
	# use dates specified on LOC email reports (5th business day of each month).
	# If 5th business day of month falls on weekend or holiday, it should be reverse drafted on the first succeeding business day.
	adjusted_requested_date = date_util.get_automated_debit_date(requested_date)

	for customer_id, val_info in minimum_due_resp['company_due_to_financial_info'].items():
		fee_dict = val_info['fee_info']
		amount_due = fee_dict['amount_short']

		customer = cast(
			models.Company,
			session.query(models.Company).get(customer_id))

		if not customer.company_settings_id:
			return None, errors.Error(f'[DATA ERROR] Company {customer_id} is missing company settings id')

		company_settings = cast(
			models.CompanySettings,
			session.query(models.CompanySettings).get(str(customer.company_settings_id)))

		if not company_settings.collections_bank_account_id:
			return None, errors.Error(f'Company {customer.name} does not have bank account to reverse payments from configured')

		_, err = repayment_util.create_repayment(
			company_id=customer_id,
			payment_insert_input=payment_types.PaymentInsertInputDict(
				company_id=customer_id,
				type=None,
				requested_amount=val_info['fee_amount'],
				amount=None,
				method=db_constants.PaymentMethodEnum.REVERSE_DRAFT_ACH,
				requested_payment_date=date_util.date_to_str(adjusted_requested_date),
				payment_date=None,
				settlement_date=None,
				recipient_bank_account_id=None,
				company_bank_account_id=str(company_settings.collections_bank_account_id),
				items_covered=dict(
					requested_to_principal=0.0,
					requested_to_interest=val_info['total_outstanding_interest'],
					requested_to_account_fees=amount_due,
				),
				customer_note='',
				bank_note=''
			),
			user_id=user_id,
			session=session,
			is_line_of_credit=True, # Even though not all customers here are LOC, we use this flag to indicate
			                        # we are paying for an account-level repayment, and so this is a
			                        # way to reuse the flag to create the repayment type we want.
			bank_admin_override_for_ach_cutoff=True
		)
		if err:
			raise err

	return True, None
