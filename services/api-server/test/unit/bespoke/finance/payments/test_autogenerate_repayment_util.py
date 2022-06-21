import datetime
import decimal
import uuid
from typing import Dict, List, cast
from sqlalchemy.orm.session import Session
from decimal import *

from bespoke.date import date_util
from bespoke.db import models, models_util, queries
from bespoke.db.db_constants import FeatureFlagEnum, PaymentType, PaymentMethodEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance.payments import autogenerate_repayment_util
from bespoke_test.db import db_unittest
from dateutil import parser

TODAY = parser.parse('2020-10-01T16:33:27.69-08:00')
TODAY_DATE = TODAY.date()

def get_relative_datetime(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

def get_relative_date(base_date: datetime.date, offset: int) -> datetime.date:
	return base_date + date_util.timedelta(days=offset)

class TestGetOptInCustomers(db_unittest.TestCase):
	def setup_data_for_get_opt_in_customers_from_chunk(
		self,
		session: Session,
		company_id: str,
		product_type: str,
		is_dummy_account: bool,
		customer_opt_in_flag: bool,
		bank_override_flag: bool,
		skip_financial_summaries: bool = False,
	) -> None:
		session.add(models.Company(
			id = company_id,
			parent_company_id = uuid.uuid4(),
			name = "Test Company",
			is_customer = True,
			identifier = "TC",
		))

		session.add(models.CompanySettings(
			company_id = company_id,
			is_dummy_account = is_dummy_account,
			feature_flags_payload = {
				FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION: bank_override_flag
			},
			is_autogenerate_repayments_enabled = customer_opt_in_flag,
		))

		if not skip_financial_summaries:
			session.add(models.FinancialSummary(
				company_id = company_id,
				product_type = product_type,
				date = TODAY_DATE,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(25.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			))

		session.flush()

	def test_for_filtering_out_non_supported_product_types(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			product_types_with_autogenerate: List[str] = [
				ProductType.DISPENSARY_FINANCING
			]
			self.setup_data_for_get_opt_in_customers_from_chunk(
				session,
				company_id,
				ProductType.LINE_OF_CREDIT,
				is_dummy_account = None,
				customer_opt_in_flag = True,
				bank_override_flag = False,
			)

			customers, customers_err = queries.get_all_customers(session)
			self.assertEqual(len(customers), 1)
			self.assertIsNone(customers_err)

			filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
				session, 
				customers,
				product_types_with_autogenerate,
				TODAY_DATE
			)

			self.assertEqual(len(filtered_customers), 0)
			self.assertEqual(len(filtered_customer_ids), 0)
			self.assertEqual(len(company_settings_lookup.keys()), 0)
			self.assertIsNone(filtered_err)

	def test_for_filtering_out_inactive_client(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			product_types_with_autogenerate: List[str] = [
				ProductType.DISPENSARY_FINANCING
			]
			self.setup_data_for_get_opt_in_customers_from_chunk(
				session,
				company_id,
				product_type = None,
				is_dummy_account = None,
				customer_opt_in_flag = True,
				bank_override_flag = False,
			)

			customers, customers_err = queries.get_all_customers(session)
			self.assertEqual(len(customers), 1)
			self.assertIsNone(customers_err)

			filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
				session, 
				customers,
				product_types_with_autogenerate,
				TODAY_DATE
			)

			self.assertEqual(len(filtered_customers), 0)
			self.assertEqual(len(filtered_customer_ids), 0)
			self.assertEqual(len(company_settings_lookup.keys()), 0)
			self.assertIsNone(filtered_err)

	def test_for_filtering_out_dummy_accounts(self) -> None:
		with session_scope(self.session_maker) as session:
			company_ids = [str(uuid.uuid4()), str(uuid.uuid4())]
			is_dummy = [True, False]
			product_types_with_autogenerate: List[str] = [
				ProductType.DISPENSARY_FINANCING
			]

			
			for i in range(2):
				self.setup_data_for_get_opt_in_customers_from_chunk(
					session,
					company_ids[i],
					ProductType.DISPENSARY_FINANCING,
					is_dummy_account = is_dummy[i],
					customer_opt_in_flag = True,
					bank_override_flag = False,
				)

			customers, customers_err = queries.get_all_customers(session)
			self.assertEqual(len(customers), 2)
			self.assertIsNone(customers_err)

			filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
				session, 
				customers,
				product_types_with_autogenerate,
				TODAY_DATE
			)

			self.assertEqual(len(filtered_customers), 1)
			self.assertEqual(len(filtered_customer_ids), 1)
			self.assertEqual(len(company_settings_lookup.keys()), 1)
			self.assertIsNone(filtered_err)

	def test_for_filtering_out_bank_overridden_customers(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			product_types_with_autogenerate: List[str] = [
				ProductType.DISPENSARY_FINANCING
			]

			self.setup_data_for_get_opt_in_customers_from_chunk(
				session,
				company_id,
				ProductType.DISPENSARY_FINANCING,
				is_dummy_account = None,
				customer_opt_in_flag = True,
				bank_override_flag = True,
			)

			customers, customers_err = queries.get_all_customers(session)
			self.assertEqual(len(customers), 1)
			self.assertIsNone(customers_err)

			filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
				session, 
				customers,
				product_types_with_autogenerate,
				TODAY_DATE
			)

			self.assertEqual(len(filtered_customers), 0)
			self.assertEqual(len(filtered_customer_ids), 0)
			self.assertEqual(len(company_settings_lookup.keys()), 0)
			self.assertIsNone(filtered_err)

	# NOTE(JR): this test works I'm just turning it off temporarily during the dummy account only testing week
	# def test_get_opt_in_customers_from_chunk_for_no_company_settings_error(self) -> None:
	# 	with session_scope(self.session_maker) as session:
	# 		company_id = str(uuid.uuid4())
	# 		product_types_with_autogenerate: List[str] = [
	# 			ProductType.DISPENSARY_FINANCING
	# 		]

	# 		self.setup_data_for_get_opt_in_customers_from_chunk(
	# 			session,
	# 			company_id,
	# 			ProductType.DISPENSARY_FINANCING,
	# 			is_dummy_account = True,
	# 			customer_opt_in_flag = True,
	# 			bank_override_flag = False,
	# 		)

	# 		customers, customers_err = queries.get_all_customers(session)
	# 		self.assertEqual(len(customers), 1)
	# 		self.assertIsNone(customers_err)

	# 		filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
	# 			session, 
	# 			customers,
	# 			product_types_with_autogenerate,
	# 			TODAY_DATE
	# 		)
	# 		self.assertIsNone(filtered_customers)
	# 		self.assertIsNone(filtered_customer_ids)
	# 		self.assertIsNone(company_settings_lookup)
	# 		self.assertIn("No company settings found for the provided companies", filtered_err.msg)

	def test_get_opt_in_customers_from_chunk_for_no_financial_summaries_error(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			product_types_with_autogenerate: List[str] = [
				ProductType.DISPENSARY_FINANCING
			]

			self.setup_data_for_get_opt_in_customers_from_chunk(
				session,
				company_id,
				ProductType.DISPENSARY_FINANCING,
				is_dummy_account = False,
				customer_opt_in_flag = True,
				bank_override_flag = False,
				skip_financial_summaries = True,
			)

			customers, customers_err = queries.get_all_customers(session)
			self.assertEqual(len(customers), 1)
			self.assertIsNone(customers_err)

			filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
				session, 
				customers,
				product_types_with_autogenerate,
				TODAY_DATE
			)
			self.assertIsNone(filtered_customers)
			self.assertIsNone(filtered_customer_ids)
			self.assertIsNone(company_settings_lookup)
			self.assertIn("No financial summaries have been found for the provided companies on", filtered_err.msg)

class TestFindMatureLoansWithoutOpenRepayments(db_unittest.TestCase):
	def setup_data_for_test(
		self,
		session: Session,
		customer_ids: List[str],
		setup_loans: bool = False,
		setup_repayments: bool = False,
		repayment_count: int = 0,
		target_date: datetime.date = TODAY_DATE,
	) -> None:
		for i in range(len(customer_ids)):
			session.add(models.Company(
				id = customer_ids[i],
				parent_company_id = uuid.uuid4(),
				name = f"Test Company {i}",
				is_customer = True,
				identifier = "TC",
			))

		loan_ids = []
		if setup_loans:
			for i in range(len(customer_ids)):
				# covers the case of the loan that is already mature
				mature_loan = models.Loan( # type: ignore
					id = uuid.uuid4(),
					company_id = customer_ids[i],
					amount = Decimal(10000.00 * i),
					approved_at = get_relative_date(target_date, -92),
					origination_date = get_relative_date(target_date, -90),
					maturity_date = target_date,
					adjusted_maturity_date = target_date,
				)
				session.add(mature_loan)

				# covers the case of the loan maturing on the next business day
				# we pull adjusted maturity date out into its own variable so
				# that the immature loan can use it to account for weekends
				# and holidays in its setup calculation
				target_adjusted_maturity_date = date_util.get_nearest_business_day(
					get_relative_date(target_date, 1), 
					preceeding = False,
				)
				maturing_loan = models.Loan( # type: ignore
					id = uuid.uuid4(),
					company_id = customer_ids[i],
					amount = Decimal(10000.00 * i),
					approved_at = get_relative_date(TODAY, -92),
					origination_date = get_relative_date(TODAY_DATE, -90),
					maturity_date = get_relative_date(target_date, 1),
					adjusted_maturity_date = target_adjusted_maturity_date,
				)
				session.add(maturing_loan)

				# covers the case of the loan that is not yet mature
				immature_loan = models.Loan( # type: ignore
					id = uuid.uuid4(),
					company_id = customer_ids[i],
					amount = Decimal(700.00 * i),
					approved_at = get_relative_date(TODAY, -92),
					origination_date = get_relative_date(TODAY_DATE, -90),
					maturity_date = get_relative_date(target_date, 2),
					adjusted_maturity_date = date_util.get_nearest_business_day(
						get_relative_date(target_adjusted_maturity_date, 1), 
						preceeding = False
					)
				)
				session.add(immature_loan)

				session.flush()

				# Only adding repayments for the already mature ids
				# This is what loan_ids is used for later on
				loan_ids.append(str(mature_loan.id))

		if setup_repayments:
			for i in range(repayment_count):
				repayment = models.Payment( # type: ignore
					company_id = customer_ids[i],
					created_at = get_relative_date(target_date, -2),
					updated_at = get_relative_date(target_date, -2),
					settlement_identifier = "1",
					type = PaymentType.REPAYMENT,
					method = PaymentMethodEnum.ACH,
					requested_amount = Decimal(5600.0),
					amount = None,
					requested_payment_date = target_date,
					payment_date = target_date,
					deposit_date = target_date,
					settlement_date = date_util.get_nearest_business_day(
						get_relative_date(target_date, 1), 
						preceeding = False
					),
					items_covered = {},
					company_bank_account_id = str(uuid.uuid4()),
					recipient_bank_account_id = str(uuid.uuid4()),
					customer_note = "",
					bank_note = "",
					requested_by_user_id = str(uuid.uuid4()),
					submitted_at = get_relative_date(target_date, -2),
					submitted_by_user_id = str(uuid.uuid4()),
					settled_at = None,
					settled_by_user_id = None,
					originating_payment_id = str(uuid.uuid4()),
					is_deleted = False,
					reversed_at = None
				)

				session.add(repayment)
				session.flush()

				session.add(models.Transaction( # type: ignore
					type = PaymentType.REPAYMENT,
					subtype = None, 
					amount = Decimal(5600.0),
					loan_id = loan_ids[i],
					payment_id = repayment.id,
					to_principal = Decimal(5000.0),
					to_interest = Decimal(500.0),
					to_fees = Decimal(100.0),
					effective_date = date_util.get_nearest_business_day(
						get_relative_date(target_date, 1), 
						preceeding = False
					),
					created_by_user_id = str(uuid.uuid4()),
					is_deleted = False
				))


	def test_customers_with_no_loans(self) -> None:
		with session_scope(self.session_maker) as session:
			customer_ids = []
			for i in range(4):
				customer_ids.append(str(uuid.uuid4()))

			self.setup_data_for_test(
				session,
				customer_ids
			)

			loans_for_repayment, err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
				session,
				customer_ids,
				TODAY_DATE
			)

			self.assertEqual(len(loans_for_repayment), 0)
			self.assertIsNone(err)

	def test_customers_with_loans_and_no_repayments(self) -> None:
		with session_scope(self.session_maker) as session:
			customer_ids = []
			for i in range(4):
				customer_ids.append(str(uuid.uuid4()))

			self.setup_data_for_test(
				session,
				customer_ids,
				setup_loans = True
			)

			loans_for_repayment, err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
				session,
				customer_ids,
				TODAY_DATE
			)

			self.assertEqual(len(loans_for_repayment), 4)
			self.assertIsNone(err)

	def test_customers_with_loans_and_repayments_for_already_mature_loans(self) -> None:
		with session_scope(self.session_maker) as session:
			target_dates = [
				get_relative_date(TODAY_DATE, -3), # Monday 9/28/2020
				get_relative_date(TODAY_DATE, -2), # Tuesday 9/29/2020
				get_relative_date(TODAY_DATE, -1), # Wednesday 9/30/2020 
				get_relative_date(TODAY_DATE, 0),  # Thursday 10/1/2020
				get_relative_date(TODAY_DATE, 1),  # Friday 10/2/2020
				# this tests for a holiday (Columbus Day) on the following Monday
				# if the code and tests are correct, then we should be testing 
				# for loans the tuesday after the holiday
				get_relative_date(TODAY_DATE, 8),  # Friday 10/9/2020
			]

			for target_date in target_dates:
				customer_ids = []
				for i in range(4):
					customer_ids.append(str(uuid.uuid4()))

				self.setup_data_for_test(
					session,
					customer_ids,
					setup_loans = True,
					setup_repayments = True,
					repayment_count = len(customer_ids),
					target_date = target_date,
				)

				loans_for_repayment, err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
					session,
					customer_ids,
					target_date,
				)

				# We set up 12 loans over 4 customers. They come in three categories
				# 1. Already matured loans (i.e. prior to this run) with repayments - won't count towards total
				# 2. Loans that are maturing on the next business day from target_date - counts toward total
				# 3. Loans that are not yet mature - won't count towards total
				# For this unit test, note that we're expecting 6 loans overall. This is because we set up
				# repayments for all 4 companies, but just for their already mature loans. Put another way: 
				# 12 total loans - 4 immature loans - 4 repayments = 4 expected loans
				number_of_companies_with_loans = len(loans_for_repayment)
				number_of_loans = 0
				for company_id in loans_for_repayment:
					number_of_loans += len(loans_for_repayment[company_id])
				self.assertEqual(number_of_companies_with_loans, 4)
				self.assertEqual(number_of_loans, 4)
				self.assertIsNone(err)

	def test_customers_with_loans_and_some_repayments(self) -> None:
		with session_scope(self.session_maker) as session:
			target_dates = [
				get_relative_date(TODAY_DATE, -3), # Monday 9/28/2020
				get_relative_date(TODAY_DATE, -2), # Tuesday 9/29/2020
				get_relative_date(TODAY_DATE, -1), # Wednesday 9/30/2020 
				get_relative_date(TODAY_DATE, 0),  # Thursday 10/1/2020
				get_relative_date(TODAY_DATE, 1),  # Friday 10/2/2020
				# this tests for a holiday (Columbus Day) on the following Monday
				# if the code and tests are correct, then we should be testing 
				# for loans the tuesday after the holiday
				get_relative_date(TODAY_DATE, 8),  # Friday 10/9/2020
			]

			for target_date in target_dates:
				customer_ids = []
				for i in range(4):
					customer_ids.append(str(uuid.uuid4()))

				self.setup_data_for_test(
					session,
					customer_ids,
					setup_loans = True,
					setup_repayments = True,
					repayment_count = 2,
					target_date = target_date,
				)

				loans_for_repayment, err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
					session,
					customer_ids,
					target_date,
				)

				# We set up 12 loans over 4 customers. They come in three categories
				# 1. Already matured loans (i.e. prior to this run) with repayments - won't count towards total
				# 2. Loans that are maturing on the next business day from target_date - counts toward total
				# 3. Loans that are not yet mature - won't count towards total
				# For this unit test, note that we're expecting 6 loans overall. This is because we only set up
				# repayments for two of the companies' already mature loans. Put another way: 
				# 12 total loans - 4 immature loans - 2 repayments = 6 expected loans
				number_of_companies_with_loans = len(loans_for_repayment)
				number_of_loans = 0
				for company_id in loans_for_repayment:
					number_of_loans += len(loans_for_repayment[company_id])
				self.assertEqual(number_of_companies_with_loans, 4)
				self.assertEqual(number_of_loans, 6)
				self.assertIsNone(err)

class TestGenerateRepaymentsForMatureLoans(db_unittest.TestCase):
	def setup_data(
		self,
		session: Session,
		customer_ids: List[str],
		collections_bank_account_ids: List[str],
		setup_loans: bool,
		customer_opt_in_flag: bool = True,
		bank_override_flag: bool = False,
	) -> None:
		# def generate_repayments_for_mature_loans(
		# 	company_settings_lookup: Dict[str, models.CompanySettings],
		# 	loans: List[models.Loan],
		# 	today: datetime.date
		# ) -> Tuple[ List[Dict[str, Any]], errors.Error ]:
		for i in range(len(customer_ids)):
			session.add(models.Company(
				id = customer_ids[i],
				parent_company_id = uuid.uuid4(),
				name = f"Test Company {i}",
				is_customer = True,
				identifier = "TC",
			))
		
			session.add(models.CompanySettings( # type: ignore
				company_id = customer_ids[i],
				collections_bank_account_id = collections_bank_account_ids[i],
				feature_flags_payload = {
					FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION: bank_override_flag
				},
				is_autogenerate_repayments_enabled = customer_opt_in_flag,
			))

			session.add(models.FinancialSummary(
				company_id = customer_ids[i],
				product_type = ProductType.DISPENSARY_FINANCING,
				date = TODAY_DATE,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(25.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			))

		loan_ids = []
		if setup_loans:
			for i in range(len(customer_ids)):
				loan = models.Loan( # type: ignore
					id = uuid.uuid4(),
					company_id = customer_ids[i],
					amount = Decimal(10000.00),
					outstanding_principal_balance = (2000.00 * (i + 1)),
					outstanding_interest = 1500.00, 
					outstanding_fees = 500.00,
					approved_at = get_relative_date(TODAY, -92),
					origination_date = get_relative_date(TODAY, -90),
					maturity_date = get_relative_date(TODAY, -1),
					adjusted_maturity_date = get_relative_date(TODAY, -1),
					disbursement_identifier = f"{i + 1}",
				)
				session.add(loan)
				session.flush()

				loan_ids.append(str(loan.id))


	# NOTE(JR): this test works just fine, but I'm turning it off during the dummy account only testing week
	# def test_generation_happy_path(self) -> None:
	# 	with session_scope(self.session_maker) as session:
	# 		product_types_with_autogenerate: List[str] = [
	# 			ProductType.DISPENSARY_FINANCING
	# 		]
	# 		bot_user_id = str(uuid.uuid4())
	# 		customer_ids = []
	# 		collections_bank_account_ids = []
	# 		for i in range(4):
	# 			customer_ids.append(str(uuid.uuid4()))
	# 			collections_bank_account_ids.append(str(uuid.uuid4()))

	# 		self.setup_data(
	# 			session,
	# 			customer_ids,
	# 			collections_bank_account_ids,
	# 			setup_loans = True,
	# 		)

	# 		customers, customers_err = queries.get_all_customers(session)
	# 		self.assertEqual(len(customers), 4)
	# 		self.assertIsNone(customers_err)

	# 		filtered_customers, filtered_customer_ids, company_settings_lookup, filtered_err = autogenerate_repayment_util.get_opt_in_customers(
	# 			session, 
	# 			customers,
	# 			product_types_with_autogenerate,
	# 			TODAY_DATE,
	# 		)

	# 		self.assertEqual(len(filtered_customers), 4)
	# 		self.assertEqual(len(filtered_customer_ids), 4)
	# 		self.assertEqual(len(company_settings_lookup.keys()), 4)
	# 		self.assertIsNone(filtered_err)

	# 		loans_for_repayment, loans_err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
	# 			session,
	# 			filtered_customer_ids,
	# 			TODAY_DATE,
	# 		)

	# 		self.assertEqual(len(loans_for_repayment), 4)
	# 		self.assertIsNone(loans_err)

	# 		email_alert_data, alert_data_err = autogenerate_repayment_util.generate_repayments_for_mature_loans(
	# 			session,
	# 			filtered_customers,
	# 			company_settings_lookup,
	# 			loans_for_repayment,
	# 			bot_user_id,
	# 		)

	# 		for i in range(4):
	# 			self.assertEqual(models_util.is_valid_uuid(email_alert_data[i]["repayment_id"]), True)
	# 			self.assertEqual(email_alert_data[i]["per_loan_alert_data"][0]["interest"], 1500)
	# 			self.assertEqual(email_alert_data[i]["per_loan_alert_data"][0]["late_fees"], 500)
			
	# 			requested_amount = email_alert_data[i]["per_loan_alert_data"][0]["principal"] + \
	# 				email_alert_data[i]["per_loan_alert_data"][0]["interest"] + \
	# 				email_alert_data[i]["per_loan_alert_data"][0]["late_fees"]
	# 			self.assertEqual(email_alert_data[i]["requested_amount"], requested_amount)

	# 		self.assertIsNone(alert_data_err)

	def test_generation_with_empty_params(self) -> None:
		with session_scope(self.session_maker) as session:
			bot_user_id = str(uuid.uuid4())
			customer_ids = []
			collections_bank_account_ids = []
			for i in range(4):
				customer_ids.append(str(uuid.uuid4()))
				collections_bank_account_ids.append(str(uuid.uuid4()))

			self.setup_data(
				session,
				customer_ids,
				collections_bank_account_ids,
				setup_loans = False,
			)

			email_alert_data, err = autogenerate_repayment_util.generate_repayments_for_mature_loans(
				session,
				cast(Dict[str, models.Company], {}),
				cast(Dict[str, models.CompanySettings], {}),
				cast(Dict[str, List[models.Loan]], {}),
				bot_user_id,
			)
			if err:
				raise err

			self.assertEqual(email_alert_data, [])
			self.assertIsNone(err)

class TestFindRepaymentAlertStartDate(db_unittest.TestCase):
	def test_weekend_with_holiday(self) -> None:
		# run test for M-F for alert week in case preferred run date changes
		dates_to_test = [
			parser.parse('2020-09-29T00:00:00.00-08:00').date(),
			parser.parse('2020-09-30T00:00:00.00-08:00').date(),
			parser.parse('2020-10-01T00:00:00.00-08:00').date(),
			parser.parse('2020-10-02T00:00:00.00-08:00').date(),
			parser.parse('2020-10-03T00:00:00.00-08:00').date(),
		]

		expected_start_date = parser.parse('2020-10-05T00:00:00.00-08:00').date()
		expected_start_maturity_date = parser.parse('2020-10-06T00:00:00.00-08:00').date()
		expected_end_date = parser.parse('2020-10-09T00:00:00.00-08:00').date()
		expected_end_maturity_date = parser.parse('2020-10-13T00:00:00.00-08:00').date()

		for date in dates_to_test:
			start_date, end_date, start_maturity_date, end_maturity_date, err = autogenerate_repayment_util.find_repayment_alert_start_date(
				date,
			)
			
			self.assertEquals(start_date, expected_start_date)
			self.assertEqual(start_maturity_date, expected_start_maturity_date)
			self.assertEquals(end_date, expected_end_date)
			self.assertEqual(end_maturity_date, expected_end_maturity_date)
			self.assertIsNone(err)

	def test_regular_week(self) -> None:
		# run test for M-F for alert week in case preferred run date changes
		dates_to_test = [
			parser.parse('2020-10-19T00:00:00.00-08:00').date(),
			parser.parse('2020-10-20T00:00:00.00-08:00').date(),
			parser.parse('2020-10-21T00:00:00.00-08:00').date(),
			parser.parse('2020-10-22T00:00:00.00-08:00').date(),
			parser.parse('2020-10-23T00:00:00.00-08:00').date(),
		]

		expected_start_date = parser.parse('2020-10-26T00:00:00.00-08:00').date()
		expected_start_maturity_date = parser.parse('2020-10-27T00:00:00.00-08:00').date()
		expected_end_date = parser.parse('2020-10-30T00:00:00.00-08:00').date()
		expected_end_maturity_date = parser.parse('2020-11-02T00:00:00.00-08:00').date()

		for date in dates_to_test:
			start_date, end_date, start_maturity_date, end_maturity_date, err = autogenerate_repayment_util.find_repayment_alert_start_date(
				date,
			)
			
			self.assertEquals(start_date, expected_start_date)
			self.assertEqual(start_maturity_date, expected_start_maturity_date)
			self.assertEquals(end_date, expected_end_date)
			self.assertEqual(end_maturity_date, expected_end_maturity_date)
			self.assertIsNone(err)

class TestFindLoansForWeeklyRepaymentReminder(db_unittest.TestCase):
	def setup_data_for_test(
		self,
		session: Session,
		customer_ids: List[str],
		target_date: datetime.date = TODAY_DATE,
	) -> None:
		for i in range(len(customer_ids)):
			session.add(models.Company(
				id = customer_ids[i],
				parent_company_id = uuid.uuid4(),
				name = f"Test Company {i}",
				is_customer = True,
				identifier = "TC",
			))

			session.add(models.CompanySettings(
				company_id = customer_ids[i],
				is_dummy_account = True,
				feature_flags_payload = {
					FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION: False
				},
				is_autogenerate_repayments_enabled = True,

			))

			session.add(models.FinancialSummary(
				company_id = customer_ids[i],
				product_type = ProductType.DISPENSARY_FINANCING,
				date = target_date,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(25.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			))

	def setup_loans_for_test(
		self,
		session: Session,
		customer_ids: List[str],
		target_date: datetime.date = TODAY_DATE,
	) -> None:
		for i in range(len(customer_ids)):
			loan = models.Loan( # type: ignore
				id = uuid.uuid4(),
				company_id = customer_ids[i],
				amount = Decimal(10000.00 * i),
				approved_at = get_relative_date(target_date, -92),
				origination_date = get_relative_date(target_date, -90),
				maturity_date = target_date,
				adjusted_maturity_date = date_util.get_nearest_business_day(
					target_date + datetime.timedelta(days = 1),
					preceeding = False,
				),
			)
			session.add(loan)
		
		session.flush()


	def test_weekend_with_holiday(self) -> None:
		with session_scope(self.session_maker) as session:
			alert_date = parser.parse('2020-09-30T00:00:00.00-08:00').date()
			alert_week_dates = [
				parser.parse('2020-10-05T00:00:00.00-08:00').date(),
				parser.parse('2020-10-06T00:00:00.00-08:00').date(),
				parser.parse('2020-10-07T00:00:00.00-08:00').date(),
				parser.parse('2020-10-08T00:00:00.00-08:00').date(),
				parser.parse('2020-10-09T00:00:00.00-08:00').date(),
			]
			customer_ids = [
				str(uuid.uuid4()),
				str(uuid.uuid4()),
				str(uuid.uuid4()),
				str(uuid.uuid4()),
			]

			self.setup_data_for_test(
				session,
				customer_ids,
				target_date = alert_date
			)
			for alert_week_date in alert_week_dates:
				self.setup_loans_for_test(
					session,
					customer_ids,
					target_date = alert_week_date
				)

			start_date, end_date, start_maturity_date, end_maturity_date, err = autogenerate_repayment_util.find_repayment_alert_start_date(
				alert_date,
			)

			self.assertEqual(start_date,parser.parse('2020-10-05T00:00:00.00-08:00').date())
			self.assertEqual(start_maturity_date,parser.parse('2020-10-06T00:00:00.00-08:00').date())
			self.assertEqual(end_date,parser.parse('2020-10-09T00:00:00.00-08:00').date())
			self.assertEqual(end_maturity_date,parser.parse('2020-10-13T00:00:00.00-08:00').date())
			self.assertIsNone(err)

			company_to_per_date_loans, err = autogenerate_repayment_util.find_loans_for_weekly_repayment_reminder(
				session,
				customer_ids,
				start_date,
				start_maturity_date,
				end_maturity_date,
			)

			for customer_id in customer_ids:
				self.assertEqual(len(company_to_per_date_loans[customer_id].items()), 5)
				for date in company_to_per_date_loans[customer_id]:
					loans = company_to_per_date_loans[customer_id][date]
					self.assertEqual(len(loans), 1)
			self.assertIsNone(err)

	def test_regular_week(self) -> None:
		with session_scope(self.session_maker) as session:
			alert_date = parser.parse('2020-10-19T00:00:00.00-08:00').date()
			alert_week_dates = [
				parser.parse('2020-10-26T00:00:00.00-08:00').date(),
				parser.parse('2020-10-27T00:00:00.00-08:00').date(),
				parser.parse('2020-10-28T00:00:00.00-08:00').date(),
				parser.parse('2020-10-29T00:00:00.00-08:00').date(),
				parser.parse('2020-10-30T00:00:00.00-08:00').date(),
			]
			customer_ids = [
				str(uuid.uuid4()),
				str(uuid.uuid4()),
				str(uuid.uuid4()),
				str(uuid.uuid4()),
			]

			self.setup_data_for_test(
				session,
				customer_ids,
				target_date = alert_date
			)
			for alert_week_date in alert_week_dates:
				self.setup_loans_for_test(
					session,
					customer_ids,
					target_date = alert_week_date
				)

			start_date, end_date, start_maturity_date, end_maturity_date, err = autogenerate_repayment_util.find_repayment_alert_start_date(
				alert_date,
			)

			self.assertEqual(start_date,parser.parse('2020-10-26T00:00:00.00-08:00').date())
			self.assertEqual(start_maturity_date,parser.parse('2020-10-27T00:00:00.00-08:00').date())
			self.assertEqual(end_date,parser.parse('2020-10-30T00:00:00.00-08:00').date())
			self.assertEqual(end_maturity_date,parser.parse('2020-11-02T00:00:00.00-08:00').date())
			self.assertIsNone(err)

			company_to_per_date_loans, err = autogenerate_repayment_util.find_loans_for_weekly_repayment_reminder(
				session,
				customer_ids,
				start_date,
				start_maturity_date,
				end_maturity_date,
			)

			for customer_id in customer_ids:
				self.assertEqual(len(company_to_per_date_loans[customer_id].items()), 5)
				for date in company_to_per_date_loans[customer_id]:
					loans = company_to_per_date_loans[customer_id][date]
					self.assertEqual(len(loans), 1)
			self.assertIsNone(err)
