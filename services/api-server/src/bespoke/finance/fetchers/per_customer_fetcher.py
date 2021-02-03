"""
  Per customer fetching of financial information.
"""
from mypy_extensions import TypedDict
from typing import Callable, Tuple, List, cast

from bespoke.db import models, db_constants
from bespoke.db.models import session_scope
from bespoke.db.models import (
	CompanyDict, CompanySettingsDict,
	LoanDict, TransactionDict, PaymentDict
)
from bespoke import errors
from bespoke.finance.types import per_customer_types

def _loan_to_str(l: LoanDict) -> str:
	return f"{l['id']},{l['origination_date']},{l['amount']},{l['status']}"

def _payment_to_str(t: PaymentDict) -> str:
	return f"{t['id']},{t['type']},{t['amount']}"

class Fetcher(object):

	def __init__(self, company_info_dict: per_customer_types.CompanyInfoDict, session_maker: Callable):
		self._company_id = company_info_dict['id']
		self._session_maker = session_maker

		self._company_info = company_info_dict
		self._settings_dict: CompanySettingsDict = None
		self._loans: List[LoanDict] = []
		self._payments: List[PaymentDict] = [] 

	def _fetch_payments(self) -> Tuple[bool, errors.Error]:
		product_type = self._settings_dict['product_type']

		with session_scope(self._session_maker) as session:

			#if product_type == db_constants.ProductType.INVENTORY_FINANCING:
			payments = cast(
				List[models.Payment],
				session.query(models.Payment).filter(
					models.Payment.company_id == self._company_id
				).all())
			if not payments:
				return True, None
			self._payments = [p.as_dict() for p in payments]							

		return True, None

	def _fetch_loans(self) -> Tuple[bool, errors.Error]:
		product_type = self._settings_dict['product_type']

		with session_scope(self._session_maker) as session:

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == self._company_id
				).all())
			if not loans:
				return True, None

			self._loans = [l.as_dict() for l in loans]

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
		

	def fetch(self) -> Tuple[bool, errors.Error]:
		_, err = self._fetch_company_details()
		if err:
			return None, err

		_, err = self._fetch_loans()
		if err:
			return None, err

		_, err = self._fetch_payments()
		if err:
			return None, err

		return True, None

	def summary(self) -> str:
		product_type = self._settings_dict['product_type']
		company_dict = self._company_info
		loans_str = 'None'
		payments_str = 'None'

		if product_type == db_constants.ProductType.INVENTORY_FINANCING:
			loans_str = '\n'.join([_loan_to_str(l) for l in self._loans])
			payments_str = '\n'.join([_payment_to_str(p) for p in self._payments])

		return 'The summary for company "{}" is\nLoans:\n{}\nPayments:\n{}'.format(
			company_dict['name'], loans_str, payments_str)

	def get_financials(self) -> per_customer_types.CustomerFinancials:
		return per_customer_types.CustomerFinancials(
		  company_info=self._company_info,
		  company_settings=self._settings_dict,
			financials=per_customer_types.Financials(
				loans=self._loans,
				payments=self._payments
			)
		)