import datetime
import decimal
import json
from datetime import timedelta
from typing import Any, Callable, Dict, List

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PRODUCT_TYPES, ProductType
from bespoke.db.models import session_scope
from bespoke.finance.loans import reports_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from sqlalchemy.orm.session import Session


TODAY = datetime.date.today()
FOUR_DAYS_FROM_TODAY = TODAY + timedelta(days=4)

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

class TestComputeAndUpdateBankFinancialSummaries(db_unittest.TestCase):

	def _run_compute_test(self, populate: Callable, expected_summaries: List[models.BankFinancialSummary], expected_error: errors.Error) -> None:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		report_date = TODAY

		with session_scope(self.session_maker) as session:
			populate(session, seed)

			statements, err = reports_util.compute_bank_financial_summaries(session, report_date)
			self.assertEqual(str(err), str(expected_error))

			if statements is not None:
				self.assertEqual(len(list(statements)), len(PRODUCT_TYPES))

				for received, expected in zip(list(sorted(statements, key=lambda x: x.product_type)), expected_summaries):
					self.assertEqual(expected.date, received.date)
					self.assertEqual(expected.product_type, received.product_type)
					self.assertEqual(expected.total_limit, received.total_limit)
					self.assertEqual(expected.total_outstanding_principal, received.total_outstanding_principal)
					self.assertEqual(expected.total_outstanding_interest, received.total_outstanding_interest)
					self.assertEqual(expected.total_outstanding_fees, received.total_outstanding_fees)
					self.assertEqual(expected.total_principal_in_requested_state, received.total_principal_in_requested_state)
					self.assertEqual(expected.available_limit, received.available_limit)
					self.assertEqual(expected.interest_accrued_today, received.interest_accrued_today)
					self.assertEqual(expected.product_type, received.product_type)
			else:
				self.assertEqual(statements, expected_summaries)


	def _run_compute_and_update_test(self, populate: Callable, count: int) -> None:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		with session_scope(self.session_maker) as session:
			populate(session, seed)
			session.commit()

			received = session.query(models.BankFinancialSummary).count()
			self.assertEqual(received, count)


	def _add_summary_for_company(
		self, 
		session: Session, 
		company_id: str, 
		product_type: str,
		is_dummy_account: bool = False) -> None:
		contract = models.Contract(
			company_id=company_id,
			product_type=product_type,
			product_config=contract_test_helper.create_contract_config(
				product_type=product_type,
				input_dict=ContractInputDict(
					interest_rate=5.00,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=0, # unused
					late_fee_structure=_get_late_fee_structure(), # unused
				)
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2024')
		)
		session.add(contract)
		session.commit()
		session.refresh(contract)

		company = session.query(models.Company).get(company_id)
		company.contract_id = contract.id

		company_settings = session.query(models.CompanySettings).get(company.company_settings_id)
		company_settings.is_dummy_account = is_dummy_account
		session.commit()

		session.add(models.FinancialSummary(
			date=TODAY,
			company_id=company_id,
			total_limit=decimal.Decimal(100.0),
			adjusted_total_limit=decimal.Decimal(100.0),
			total_outstanding_principal=decimal.Decimal(50.0),
			total_outstanding_principal_for_interest=decimal.Decimal(60.0),
			total_outstanding_interest=decimal.Decimal(12.50),
			total_outstanding_fees=decimal.Decimal(5.25),
			total_principal_in_requested_state=decimal.Decimal(3.15),
			available_limit=decimal.Decimal(25.00),
			interest_accrued_today=decimal.Decimal(2.1),
			minimum_monthly_payload={},
			account_level_balance_payload={},
			product_type=product_type
		))

		# This financial summary should not be used because it is in the future
		session.add(models.FinancialSummary(
			date=FOUR_DAYS_FROM_TODAY,
			company_id=company_id,
			total_limit=decimal.Decimal(120.0),
			adjusted_total_limit=decimal.Decimal(120.0),
			total_outstanding_principal=decimal.Decimal(5.0),
			total_outstanding_principal_for_interest=decimal.Decimal(6.0),
			total_outstanding_interest=decimal.Decimal(12.60),
			total_outstanding_fees=decimal.Decimal(15.25),
			total_principal_in_requested_state=decimal.Decimal(13.15),
			available_limit=decimal.Decimal(125.00),
			interest_accrued_today=decimal.Decimal(12.1),
			minimum_monthly_payload={},
			account_level_balance_payload={},
			product_type=product_type
		))

	def test_failure_on_unpopulated(self) -> None:
		def populate(session: Session, seed: test_helper.BasicSeed) -> None:
			return
		self._run_compute_test(populate, None, errors.Error("No financial summary found that has a date populated"))


	def test_compute_success_with_one_financial_summary(self) -> None:
		def populate(session: Session, seed: test_helper.BasicSeed) -> None:
			company_id = seed.get_company_id('company_admin', index=0)
			self._add_summary_for_company(session, company_id, ProductType.PURCHASE_MONEY_FINANCING)

		self._run_compute_test(populate, expected_summaries=[
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.INVENTORY_FINANCING,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0)
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.INVOICE_FINANCING,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.LINE_OF_CREDIT,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.PURCHASE_MONEY_FINANCING,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=round(decimal.Decimal(3.15), 2),
				interest_accrued_today=round(decimal.Decimal(2.10), 2),
				available_limit=decimal.Decimal(25.00),
			),
		], expected_error=None)


	def test_compute_success_with_two_financial_summaries_same_type(self) -> None:
		def populate(session: Session, seed: test_helper.BasicSeed) -> None:
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.INVENTORY_FINANCING)
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=2), ProductType.INVENTORY_FINANCING)

		self._run_compute_test(populate, expected_summaries=[
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.INVENTORY_FINANCING,
				total_limit=decimal.Decimal(200.0),
				adjusted_total_limit=decimal.Decimal(200.0),
				total_outstanding_principal=decimal.Decimal(100.0),
				total_outstanding_interest=decimal.Decimal(25.00),
				total_outstanding_fees=decimal.Decimal(10.50),
				total_principal_in_requested_state=round(decimal.Decimal(2 * 3.15), 2),
				interest_accrued_today=round(decimal.Decimal(2 * 2.10), 2),
				available_limit=decimal.Decimal(50.0),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.INVOICE_FINANCING,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.LINE_OF_CREDIT,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.PURCHASE_MONEY_FINANCING,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
		], expected_error=None)


	def test_compute_success_with_two_financial_summaries_different_types_ignore_dummy_account(self) -> None:
		def populate(session: Session, seed: test_helper.BasicSeed) -> None:
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.INVENTORY_FINANCING)
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=2), ProductType.LINE_OF_CREDIT)
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=1), ProductType.LINE_OF_CREDIT, 
				is_dummy_account=True
			)

		self._run_compute_test(populate, expected_summaries=[
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.INVENTORY_FINANCING,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=round(decimal.Decimal(3.15), 2),
				interest_accrued_today=round(decimal.Decimal(2.10), 2),
				available_limit=decimal.Decimal(25.00),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.INVOICE_FINANCING,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.LINE_OF_CREDIT,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=round(decimal.Decimal(3.15), 2),
				interest_accrued_today=round(decimal.Decimal(2.10), 2),
				available_limit=decimal.Decimal(25.00),
			),
			models.BankFinancialSummary(
				date=TODAY,
				product_type=ProductType.PURCHASE_MONEY_FINANCING,
				total_limit=decimal.Decimal(0),
				adjusted_total_limit=decimal.Decimal(0),
				total_outstanding_principal=decimal.Decimal(0),
				total_outstanding_interest=decimal.Decimal(0),
				total_outstanding_fees=decimal.Decimal(0),
				total_principal_in_requested_state=decimal.Decimal(0),
				interest_accrued_today=decimal.Decimal(0),
				available_limit=decimal.Decimal(0),
			),
		], expected_error=None)


	def test_compute_and_update_maintains_the_count_once(self) -> None:
		def populate(session: Session, seed: test_helper.BasicSeed) -> None:
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.INVENTORY_FINANCING)
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=2), ProductType.LINE_OF_CREDIT)

			reports_util.compute_and_update_bank_financial_summaries(session, TODAY)

		self._run_compute_and_update_test(populate, len(PRODUCT_TYPES))


	def test_compute_and_update_maintains_the_count_twice(self) -> None:
		def populate(session: Session, seed: test_helper.BasicSeed) -> None:
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.INVENTORY_FINANCING)
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=2), ProductType.LINE_OF_CREDIT)

			reports_util.compute_and_update_bank_financial_summaries(session, TODAY)
			session.commit()

			reports_util.compute_and_update_bank_financial_summaries(session, TODAY)
			session.commit()

		self._run_compute_and_update_test(populate, len(PRODUCT_TYPES))


	def test_gets_companies_that_need_recompute(self) -> None:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			self._add_summary_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.INVENTORY_FINANCING)

			count = session.query(models.Company).count()
			self.assertEqual(count, 4)

			count = session.query(models.Company).filter(models.Company.needs_balance_recomputed == True).count()
			self.assertEqual(count, 0)

		with session_scope(self.session_maker) as session:
			company = session.query(models.Company).get(company_id)
			company.needs_balance_recomputed = True

		company_dicts = reports_util.list_companies_that_need_balances_recomputed(self.session_maker)
		self.assertEqual(len(company_dicts), 1)
		self.assertEqual(company_dicts[0]["id"], str(company_id))

		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_companies_that_need_recompute(
			self.session_maker, TODAY)

		self.assertIsNone(fatal_error)
		self.assertEqual(len(descriptive_errors), 0)

		company_dicts = reports_util.list_companies_that_need_balances_recomputed(self.session_maker)
		self.assertEqual(len(company_dicts), 0)

