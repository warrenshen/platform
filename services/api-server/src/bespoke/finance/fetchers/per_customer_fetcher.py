"""
  Per customer fetching of financial information.
"""
import datetime
from datetime import timedelta
from typing import Callable, List, Tuple, cast
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.models import (CompanySettingsDict, ContractDict,
                               EbbaApplicationDict, LoanDict, PaymentDict,
                               TransactionDict, session_scope)
from bespoke.finance import contract_util
from bespoke.finance.types import per_customer_types
from bespoke.finance.contracts import manage_contract_util

def _loan_to_str(l: LoanDict) -> str:
	return f"{l['id']},{l['origination_date']},{l['amount']},{l['status']}"

def _payment_to_str(p: PaymentDict) -> str:
	return f"{p['id']},{p['type']},{p['amount']}"

def _transaction_to_str(t: TransactionDict) -> str:
	return f"{t['id']},{t['type']},{t['amount']},{t['loan_id']},{t['to_principal']},{t['to_interest']},{t['to_fees']}"

def _extend_the_last_contract_if_needed(
	contract_dicts: List[models.ContractDict], today: datetime.date, session: Session) -> Tuple[bool, errors.Error]:
	
	company_id = None
	contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
	if err:
		return False, err

	cur_contract, no_contract_in_range_err = contract_helper.get_contract(today)
	if cur_contract:
		end_date, err = cur_contract.get_adjusted_end_date()
		if err:
			return None, err
		
		if end_date > (today + timedelta(days=7)):
			# No need to update the contract, we have a working one for at least a week
			return False, None

	# We've determined here we need to extend the contract

	# Find the last contract and extend it if it hasn't been
	# terminated yet.
	latest_contract_dict = contract_helper.get_latest_contract_dict()

	if latest_contract_dict['terminated_at']:
		# If the contrat is already terminated though, we cant extend the
		# contract and need to throw an error
		raise no_contract_in_range_err

	# If the contract ended by this report date, but it has
	# not been terminated, then extend this contract for another year
	contract_id = latest_contract_dict['id']
	contract_end_date = latest_contract_dict['adjusted_end_date']
	if not contract_end_date:
		raise errors.Error('No adjusted end date set on the latest contract, therefore we cannot extend it')
	
	start_date = latest_contract_dict['start_date']
	if not start_date:
		raise errors.Error('No start date set on the latest contract, therefore we cannot extend it')

	new_end_date = contract_end_date + timedelta(days=365)
	manage_contract_util.update_contract(req=manage_contract_util.UpdateContractReqDict(
		contract_id=contract_id,
		contract_fields=manage_contract_util.ContractFieldsDict(
			start_date=date_util.date_to_str(start_date),
			end_date=date_util.date_to_str(new_end_date)
		),
		update_dates_only=True
	),
	bank_admin_user_id=None,
	session=session)

	return True, None

class Fetcher(object):

	def __init__(self,
		company_info_dict: per_customer_types.CompanyInfoDict, session_maker: Callable, ignore_deleted: bool):
		self._company_id = company_info_dict['id']
		self._session_maker = session_maker

		self._company_info = company_info_dict
		self._settings_dict: CompanySettingsDict = None
		self._contracts: List[ContractDict] = []
		self._loans: List[LoanDict] = []
		self._payments: List[PaymentDict] = []
		self._purchase_orders: List[models.PurchaseOrderDict] = []
		self._invoices: List[models.InvoiceDict] = []
		self._augmented_transactions: List[per_customer_types.AugmentedTransactionDict] = []
		self._ebba_applications: List[EbbaApplicationDict] = []
		self._active_borrowing_base: EbbaApplicationDict = None
		self._active_financial_report: EbbaApplicationDict = None
		self._ignore_deleted = ignore_deleted

	def _fetch_contracts(self, today: datetime.date) -> Tuple[bool, errors.Error]:

		with session_scope(self._session_maker) as session:
			contracts = cast(
				List[models.Contract],
				contract_util.get_active_contracts_base_query(session).filter(
					models.Contract.company_id == self._company_id
				).all())
			if not contracts:
				return True, None
			self._contracts = [c.as_dict() for c in contracts]

			# Extend contracts before doing any financial computations
			was_extended, err = _extend_the_last_contract_if_needed(
				self._contracts, today, session)
			if err:
				raise err

			if was_extended:
				# Fetch the contracts again if we needed to extend it
				contracts = cast(
					List[models.Contract],
					contract_util.get_active_contracts_base_query(session).filter(
						models.Contract.company_id == self._company_id
					).all())
				if not contracts:
					return True, None
				self._contracts = [c.as_dict() for c in contracts]

		return True, None

	def _fetch_transactions(
		self, payments: List[models.PaymentDict]) -> Tuple[bool, errors.Error]:
		if not payments:
			return True, None

		payment_ids = [p['id'] for p in payments]

		with session_scope(self._session_maker) as session:
			query = session.query(models.Transaction).filter(
					models.Transaction.payment_id.in_(payment_ids)
				)
			if self._ignore_deleted:
				query = query.filter(cast(Callable, models.Transaction.is_deleted.isnot)(True))

			transactions = cast(List[models.Transaction], query.all())

			if not transactions:
				return True, None

			self._augmented_transactions, err = models_util.get_augmented_transactions(
				[t.as_dict() for t in transactions], payments
			)
			if err:
				return None, err

		return True, None

	def _fetch_payments(self) -> Tuple[bool, errors.Error]:

		with session_scope(self._session_maker) as session:
			query = session.query(models.Payment).filter(
					models.Payment.company_id == self._company_id
			)

			if self._ignore_deleted:
				query = query.filter(cast(Callable, models.Payment.is_deleted.isnot)(True))

			payments = cast(List[models.Payment], query.all())

			if not payments:
				return True, None
			self._payments = [p.as_dict() for p in payments if p.amount is not None]

		return True, None

	def _fetch_loans(self) -> Tuple[bool, errors.Error]:

		with session_scope(self._session_maker) as session:
			query = session.query(models.Loan).filter(
				models.Loan.company_id == self._company_id
			).order_by(
				models.Loan.origination_date.asc()
			)

			if self._ignore_deleted:
				query = query.filter(cast(Callable, models.Loan.is_deleted.isnot)(True))

			loans = cast(List[models.Loan], query.all())
			if not loans:
				return True, None

			self._loans = [l.as_dict() for l in loans]

		return True, None

	def _fetch_invoices(self, loans: List[models.LoanDict]) -> Tuple[bool, errors.Error]:
		if not loans:
			return True, None

		artifact_ids = []
		for loan in loans:
			if loan['artifact_id']:
				artifact_ids.append(loan['artifact_id'])

		with session_scope(self._session_maker) as session:
			query = session.query(models.Invoice).filter(
					models.Invoice.company_id == self._company_id
				).filter(
					models.Invoice.id.in_(artifact_ids)
				)

			if self._ignore_deleted:
				query = query.filter(cast(Callable, models.Invoice.is_deleted.isnot)(True))

			invoices = cast(List[models.Invoice], query.all())
			if not invoices:
				return True, None

			self._invoices = [inv.as_dict() for inv in invoices]

		return True, None

	def _fetch_purchase_orders(self, loans: List[models.LoanDict]) -> Tuple[bool, errors.Error]:
		if not loans:
			return True, None

		artifact_ids = []
		for loan in loans:
			if loan['artifact_id']:
				artifact_ids.append(loan['artifact_id'])

		with session_scope(self._session_maker) as session:
			query = session.query(models.PurchaseOrder).filter(
					models.PurchaseOrder.company_id == self._company_id
				).filter(
					models.PurchaseOrder.id.in_(artifact_ids)
				)

			if self._ignore_deleted:
				query = query.filter(cast(Callable, models.PurchaseOrder.is_deleted.isnot)(True))

			purchase_orders = cast(List[models.PurchaseOrder], query.all())
			if not purchase_orders:
				return True, None

			self._purchase_orders = [po.as_dict() for po in purchase_orders]

		return True, None

	def _fetch_company_details(self) -> Tuple[bool, errors.Error]:
		# Which type of product is this customer using?
		with session_scope(self._session_maker) as session:
			settings = cast(
				models.CompanySettings,
				session.query(models.CompanySettings).filter(
					models.CompanySettings.company_id == self._company_id
				).first())
			if not settings:
				return None, errors.Error('No settings found')

			self._settings_dict = settings.as_dict()

		return True, None


	def _fetch_ebba_applications(self) -> Tuple[bool, errors.Error]:
		with session_scope(self._session_maker) as session:
			ebba_applications = cast(
				List[models.EbbaApplication],
				session.query(models.EbbaApplication).filter(
					models.EbbaApplication.company_id == self._company_id
				).all()
			)

			self._ebba_applications = [e.as_dict() for e in ebba_applications] if ebba_applications else []

		return True, None

	@errors.return_error_tuple
	def fetch(self, today: datetime.date) -> Tuple[bool, errors.Error]:
		_, err = self._fetch_contracts(today)
		if err:
			raise err

		_, err = self._fetch_company_details()
		if err:
			raise err

		_, err = self._fetch_loans()
		if err:
			raise err

		_, err = self._fetch_payments()
		if err:
			raise err

		_, err = self._fetch_transactions(self._payments)
		if err:
			raise err

		_, err = self._fetch_invoices(self._loans)
		if err:
			raise err

		_, err = self._fetch_purchase_orders(self._loans)
		if err:
			raise err

		_, err = self._fetch_ebba_applications()
		if err:
			raise err

		# Use the 'active_ebba_application' in CompanySettings to find the
		# EbbaApplicationDict associated with that application. If this becomes
		# problematically slow, we can author a new function that takes and
		# application and just fetches that one from the database. This "find"
		# operation is O(n) where n is the number of EbbaApplications
		if self._ebba_applications and self._settings_dict:
			active_borrowing_base_id = self._settings_dict.get('active_borrowing_base_id')
			if active_borrowing_base_id:
				matching = [app for app in self._ebba_applications if app["id"] == active_borrowing_base_id]
				if len(matching) != 1:
					raise errors.Error(f"Failed to find borrowing base ebba application with id '{active_borrowing_base_id}'")
				self._active_borrowing_base = matching[0]

			active_financial_report_id = self._settings_dict.get('active_financial_report_id')
			if active_financial_report_id:
				matching = [app for app in self._ebba_applications if app["id"] == active_financial_report_id]
				if len(matching) != 1:
					raise errors.Error(f"Failed to find financial report ebba application with id '{active_financial_report_id}'")
				self._active_financial_report = matching[0]

		return True, None

	def summary(self) -> str:
		company_dict = self._company_info

		loans_str = '\n'.join([_loan_to_str(l) for l in self._loans])
		payments_str = '\n'.join([_payment_to_str(p) for p in self._payments])
		transactions_str = '\n'.join([_transaction_to_str(t['transaction']) for t in self._augmented_transactions])

		return 'The summary for company "{}" is\nLoans:\n{}\nPayments:\n{}\nTransactions{}\n'.format(
			company_dict['name'], loans_str, payments_str, transactions_str)

	def get_financials(self) -> per_customer_types.CustomerFinancials:
		return per_customer_types.CustomerFinancials(
			company_info=self._company_info,
			company_settings=self._settings_dict,
			financials=per_customer_types.Financials(
				contracts=self._contracts,
				loans=self._loans,
				payments=self._payments,
				invoices=self._invoices,
				purchase_orders=self._purchase_orders,
				augmented_transactions=self._augmented_transactions,
				ebba_applications=self._ebba_applications,
				active_borrowing_base=self._active_borrowing_base,
				active_financial_report=self._active_financial_report
			)
		)
