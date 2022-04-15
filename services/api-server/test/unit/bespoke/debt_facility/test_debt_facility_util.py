import json
import datetime
import uuid
from base64 import b64encode
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from flask import Blueprint, Response, current_app, make_response, request
from sqlalchemy import (JSON, BigInteger, Boolean, Float, Column, Date, DateTime,
                        ForeignKey, Integer, Numeric, String, Text, update)
from sqlalchemy.orm.session import Session
from decimal import *

from manage import app
from bespoke.date import date_util
from bespoke.db.db_constants import (CompanyDebtFacilityStatus, DebtFacilityEventCategory, 
	LoanDebtFacilityStatus, ProductType, DebtFacilityCapacityTypeEnum)
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db.model_types import (
	PaymentItemsCoveredDict
)
from bespoke.debt_facility import debt_facility_util
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util
from bespoke.finance.payments import fees_due_util
from bespoke.finance.reports import loan_balances
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper
from bespoke_test import auth_helper
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from dateutil import parser

TODAY = parser.parse('2020-10-01T16:33:27.69-08:00')
TODAY_DATE = TODAY.date()

def get_relative_date(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

class TestUpdateCompanyDebtFacilityStatusView(db_unittest.TestCase):
	def setup_data_for_waiver_to_other_statuses_tests(
		self,
		session: Session,
		user_id: str,
		company_id: str,
		debt_facility_id: str,
		loan_report_ids: List[str],
		waiver_date: str,
		waiver_expiration_date: str,
		old_company_status: str,
		old_loan_status: str
	) -> None:
		loan_report_id1 = loan_report_ids[0]
		loan_report_id2 = loan_report_ids[1]

		session.add(models.User(
			id = user_id,
			company_id = company_id,
			parent_company_id = uuid.uuid4(),
			email = 'rabbit@100acrewood.com',
			password = 'xxxx',
			role = 'Worrywort',
			first_name = 'Rabbit',
			last_name = 'Daws',
			login_method = 'simple',
			is_deleted = None,
		))

		session.add(models.Company(
			id = company_id,
			parent_company_id = uuid.uuid4(),
			name = "Waiver Company",
			debt_facility_status = old_company_status,
			debt_facility_waiver_date = date_util.load_date_str(waiver_date) \
				if waiver_date else None,
			debt_facility_waiver_expiration_date = date_util.load_date_str(waiver_expiration_date) \
				if waiver_expiration_date else None
		))

		session.add(models.Contract(
			id = uuid.uuid4(),
			company_id = company_id,
			product_type=ProductType.INVENTORY_FINANCING,
			product_config=contract_test_helper.create_contract_config(
				product_type=ProductType.INVENTORY_FINANCING,
				input_dict=ContractInputDict(
					wire_fee=25.0,
					interest_rate=0.05,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=60,
					late_fee_structure='', # unused
					preceeding_business_day=True
				)
			)
		))

		session.add(models.DebtFacility(
			id = debt_facility_id,
			name = "CoVenture"
		))

		session.add(models.LoanReport( # type: ignore
			id = loan_report_id1,
			debt_facility_id = debt_facility_id,
			debt_facility_status = old_loan_status,
			debt_facility_waiver_date = date_util.load_date_str(waiver_date) \
				if waiver_date else None,
			debt_facility_waiver_expiration_date = date_util.load_date_str(waiver_expiration_date) \
				if waiver_expiration_date else None
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id1,
			amount = Decimal(10000.00),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, 10),
			adjusted_maturity_date = get_relative_date(TODAY, 10)
		))

		session.add(models.LoanReport( # type: ignore
			id = loan_report_id2,
			debt_facility_id = debt_facility_id,
			debt_facility_status = old_loan_status,
			debt_facility_waiver_date = date_util.load_date_str(waiver_date) \
				if waiver_date else None,
			debt_facility_waiver_expiration_date = date_util.load_date_str(waiver_expiration_date) \
				if waiver_expiration_date else None
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id2,
			amount = Decimal(10000.00),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, 10),
			adjusted_maturity_date = get_relative_date(TODAY, 10)
		))

		session.flush()

	def status_change_test_runner(
		self,
		old_company_status: str,
		new_company_status: str,
		old_loan_status: str, 
		new_loan_status: str,
		old_waiver_date: str,
		new_waiver_date: str,
		old_waiver_expiration_date: str,
		new_waiver_expiration_date: str,
		expected_loan_update_count: int,
		debt_facility_id_should_be_populated: bool
	) -> None:
		with session_scope(self.session_maker) as session:
			user_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())
			loan_report_id1 = str(uuid.uuid4())
			loan_report_id2 = str(uuid.uuid4())
			self.setup_data_for_waiver_to_other_statuses_tests(
				session,
				user_id,
				company_id,
				debt_facility_id,
				[loan_report_id1, loan_report_id2],
				waiver_date = old_waiver_date,
				waiver_expiration_date = old_waiver_expiration_date,
				old_company_status = old_company_status,
				old_loan_status = old_loan_status
			)

			user = cast(
				models.User,
				session.query(models.User).filter(
					models.User.id == user_id
			).first())

			loans_updated_count, err = debt_facility_util.update_company_debt_facility_status(
				session,
				user,
				company_id,
				new_company_status,
				status_change_comment = "Unit test",
				waiver_date = new_waiver_date,
				waiver_expiration_date = new_waiver_expiration_date
			)

			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
			).first())

			loan_reports = cast(
				List[models.LoanReport],
				session.query(models.LoanReport).filter(
					models.LoanReport.id.in_([loan_report_id1, loan_report_id2])
			).all())

			for loan_report in loan_reports:
				self.assertEqual(loan_report.debt_facility_status, new_loan_status)
				self.assertEqual(
					loan_report.debt_facility_waiver_date,
					# if guard for when status is the same
					date_util.load_date_str(new_waiver_date) if new_waiver_date else None
				)
				self.assertEqual(
					loan_report.debt_facility_waiver_expiration_date,
					# if guard for when status is the same
					date_util.load_date_str(new_waiver_expiration_date) if new_waiver_expiration_date else None
				)

				if debt_facility_id_should_be_populated:
					self.assertEqual(str(loan_report.debt_facility_id), debt_facility_id)
				else:
					self.assertEqual(loan_report.debt_facility_id, None)

			self.assertEqual(company.debt_facility_status, new_company_status)
			self.assertEqual(
				company.debt_facility_waiver_date,
				# if guard for when status is the same
				date_util.load_date_str(new_waiver_date) if new_waiver_date else None
			) 
			self.assertEqual(
				company.debt_facility_waiver_expiration_date,
				# if guard for when status is the same
				date_util.load_date_str(new_waiver_expiration_date) if new_waiver_expiration_date else None
			)

			self.assertEqual(loans_updated_count, expected_loan_update_count)

	# Waiver state to X starts here

	def test_waiver_to_good_standing_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.WAIVER,
			new_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			old_loan_status = CompanyDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_waiver_to_probation_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.WAIVER,
			new_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			old_loan_status = CompanyDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_waiver_to_ineligible_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.WAIVER,
			new_company_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY,
			old_loan_status = CompanyDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)
		
	def test_waiver_to_paused_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.WAIVER,
			new_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			old_loan_status = CompanyDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)
		
	def test_waiver_to_defaulted_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.WAIVER,
			new_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			old_loan_status = CompanyDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	# Good state to bad state starts here

	def test_good_standing_to_paused_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			new_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	def test_probation_to_paused_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			new_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	def test_ineligible_to_paused_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY,
			new_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			old_loan_status = LoanDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	def test_good_standing_to_defaulted_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			new_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	def test_probation_to_defaulted_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			new_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	def test_ineligible_to_defaulted_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY,
			new_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			old_loan_status = LoanDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-12-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	# Good to good status starts here, this is just ensure that it -does not- change loan statuses

	def test_good_standing_to_probation_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			new_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 0,
			debt_facility_id_should_be_populated = True
		)

	def test_probation_to_good_standing_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			new_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 0,
			debt_facility_id_should_be_populated = True
		)

	# Bad to bad status starts here, this is to ensure we clear out loan level waivers
	# Unless someone submits the same status (presumably on accident) then it should do nothing

	def test_paused_to_defaulted_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			new_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			old_loan_status = LoanDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-09-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	def test_defaulted_to_defaulted_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			new_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			old_loan_status = LoanDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.WAIVER,
			old_waiver_date = "2020-09-01",
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = "2020-09-01",
			new_waiver_expiration_date = "2020-09-01",
			expected_loan_update_count = 0,
			debt_facility_id_should_be_populated = True
		)

	def test_paused_to_paused_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			new_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			old_loan_status = LoanDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.WAIVER,
			old_waiver_date = "2020-09-01",
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = "2020-09-01",
			new_waiver_expiration_date = "2020-09-01",
			expected_loan_update_count = 0,
			debt_facility_id_should_be_populated = True
		)

	def test_defaulted_to_paused_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			new_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			old_loan_status = LoanDebtFacilityStatus.WAIVER,
			new_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			old_waiver_date = "2020-09-01",
			new_waiver_date = None,
			old_waiver_expiration_date = "2020-09-01",
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = False
		)

	# X state to waiver state starts here

	def test_good_standing_waiver_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			new_company_status = CompanyDebtFacilityStatus.WAIVER,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = CompanyDebtFacilityStatus.WAIVER,
			old_waiver_date = None,
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = "2020-12-01",
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_probation_to_waiver_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			new_company_status = CompanyDebtFacilityStatus.WAIVER,
			old_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			new_loan_status = CompanyDebtFacilityStatus.WAIVER,
			old_waiver_date = None,
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = "2020-12-01",
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_ineligible_to_waiver_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY,
			new_company_status = CompanyDebtFacilityStatus.WAIVER,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = CompanyDebtFacilityStatus.WAIVER,
			old_waiver_date = None,
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = "2020-12-01",
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)
		
	def test_paused_to_waiver_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			new_company_status = CompanyDebtFacilityStatus.WAIVER,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = CompanyDebtFacilityStatus.WAIVER,
			old_waiver_date = None,
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = "2020-12-01",
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)
		
	def test_defaulted_to_waiver_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			new_company_status = CompanyDebtFacilityStatus.WAIVER,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = CompanyDebtFacilityStatus.WAIVER,
			old_waiver_date = None,
			new_waiver_date = "2020-09-01",
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = "2020-12-01",
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	# Bad state to good state

	def test_paused_to_good_standing_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			new_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_defaulted_to_good_standing_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			new_company_status = CompanyDebtFacilityStatus.GOOD_STANDING,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_paused_to_probation_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.OUT_OF_COMPLIANCE,
			new_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

	def test_defaulted_to_probation_status_update(self) -> None:
		self.status_change_test_runner(
			old_company_status = CompanyDebtFacilityStatus.DEFAULTING,
			new_company_status = CompanyDebtFacilityStatus.ON_PROBATION,
			old_loan_status = LoanDebtFacilityStatus.UPDATE_REQUIRED,
			new_loan_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
			old_waiver_date = None,
			new_waiver_date = None,
			old_waiver_expiration_date = None,
			new_waiver_expiration_date = None,
			expected_loan_update_count = 2,
			debt_facility_id_should_be_populated = True
		)

class TestDebtFacilityCheckForPastDueLoansView(db_unittest.TestCase):
	def setup_data_for_unexpired_company_waiver_test(
		self, 
		session: Session, 
		company_id: str, 
		debt_facility_id: str,
		setup_company: bool = True,
		setup_debt_facility: bool = True
	) -> None:
		loan_report_id = uuid.uuid4()
		waiver_date = get_relative_date(TODAY, -10)
		waiver_expiration_date = get_relative_date(TODAY, 10)

		if setup_company:
			session.add(models.Company(
				id = company_id,
				parent_company_id = uuid.uuid4(),
				name = "Unexpired Waiver Company",
				debt_facility_status = CompanyDebtFacilityStatus.WAIVER,
				debt_facility_waiver_date = waiver_date,
				debt_facility_waiver_expiration_date = waiver_expiration_date,
				is_customer = True
			))

		if setup_debt_facility:
			session.add(models.DebtFacility(
				id = debt_facility_id,
				name = "Unit Test Debt Facility"
			))

		session.add(models.LoanReport( # type: ignore
			id = loan_report_id,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.WAIVER,
			debt_facility_waiver_date = waiver_date,
			debt_facility_waiver_expiration_date = waiver_expiration_date
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, -40),
			adjusted_maturity_date = get_relative_date(TODAY, -40)
		))

	def setup_data_for_expired_company_waiver_test(
		self, 
		session: Session, 
		company_id: str,
		debt_facility_id: str,
		setup_company: bool = True,
		setup_debt_facility: bool = True
	) -> None:
		loan_report_id1 = uuid.uuid4()
		loan_report_id2 = uuid.uuid4()
		waiver_date = get_relative_date(TODAY, -40)
		waiver_expiration_date = get_relative_date(TODAY, -10)

		if setup_company:
			session.add(models.Company(
				id = company_id,
				parent_company_id = uuid.uuid4(),
				name = "Expired Waiver Company",
				debt_facility_status = CompanyDebtFacilityStatus.WAIVER,
				debt_facility_waiver_date = waiver_date,
				debt_facility_waiver_expiration_date = waiver_expiration_date,
				is_customer = True,
			))

		# Handles case where loan has an expired waiver
		session.add(models.LoanReport( # type: ignore
			id = loan_report_id1,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.WAIVER,
			debt_facility_waiver_date = waiver_date,
			debt_facility_waiver_expiration_date = waiver_expiration_date
		))

		# Handles case where loan has no waiver
		session.add(models.LoanReport( # type: ignore
			id = loan_report_id2,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id1,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, -40),
			adjusted_maturity_date = get_relative_date(TODAY, -40)
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id2,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -9),
			maturity_date = get_relative_date(TODAY, 40),
			adjusted_maturity_date = get_relative_date(TODAY, 40)
		))

	def setup_data_for_unexpired_loan_waiver_test(
		self, 
		session: Session, 
		company_id: str, 
		debt_facility_id: str,
		setup_company: bool = True,
		setup_debt_facility: bool = True
	) -> None:
		
		loan_report_id = uuid.uuid4()
		waiver_date = get_relative_date(TODAY, -40)
		waiver_expiration_date = get_relative_date(TODAY, 10)

		if setup_company:
			session.add(models.Company(
				id = company_id,
				parent_company_id = uuid.uuid4(),
				name = "No Waiver Ineligible Company",
				debt_facility_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY,
				is_customer = True
			))

		if setup_debt_facility:
			session.add(models.DebtFacility(
				id = debt_facility_id,
				name = "Unit Test Debt Facility"
			))

		session.add(models.LoanReport( # type: ignore
			id = loan_report_id,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.WAIVER,
			debt_facility_waiver_date = waiver_date,
			debt_facility_waiver_expiration_date = waiver_expiration_date
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, -40),
			adjusted_maturity_date = get_relative_date(TODAY, -40)
		))

	def setup_data_for_expired_loan_waiver_test(
		self, 
		session: Session, 
		company_id: str, 
		debt_facility_id: str,
		setup_company: bool = True,
		setup_debt_facility: bool = True
	) -> None:
		
		loan_report_id1 = uuid.uuid4()
		loan_report_id2 = uuid.uuid4()
		waiver_date = get_relative_date(TODAY, -40)
		waiver_expiration_date = get_relative_date(TODAY, -10)

		if setup_company:
			session.add(models.Company(
				id = company_id,
				parent_company_id = uuid.uuid4(),
				name = "No Waiver Ineligible Company",
				debt_facility_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY,
				is_customer = True
			))

		if setup_debt_facility:
			session.add(models.DebtFacility(
				id = debt_facility_id,
				name = "Unit Test Debt Facility"
			))

		# Handles case where loan has an expired waiver
		session.add(models.LoanReport( # type: ignore
			id = loan_report_id1,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.WAIVER,
			debt_facility_waiver_date = waiver_date,
			debt_facility_waiver_expiration_date = waiver_expiration_date
		))

		# Handles case where loan is not even in a debt facility
		session.add(models.LoanReport( # type: ignore
			id = loan_report_id2,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.BESPOKE_BALANCE_SHEET
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id1,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, -40),
			adjusted_maturity_date = get_relative_date(TODAY, -40)
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id2,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -9),
			maturity_date = get_relative_date(TODAY, 40),
			adjusted_maturity_date = get_relative_date(TODAY, 40)
		))

	def setup_data_for_no_company_or_loan_waivers_test(
		self, 
		session: Session, 
		company_id: str, 
		debt_facility_id: str,
		setup_company: bool = True,
		setup_debt_facility: bool = True
	) -> None:
		loan_report_id = uuid.uuid4()

		if setup_company:
			session.add(models.Company(
				id = company_id,
				parent_company_id = uuid.uuid4(),
				name = "Good Standing Company",
				debt_facility_status = CompanyDebtFacilityStatus.GOOD_STANDING,
				is_customer = True
			))

		if setup_debt_facility:
			session.add(models.DebtFacility(
				id = debt_facility_id,
				name = "Unit Test Debt Facility"
			))

		session.add(models.LoanReport( # type: ignore
			id = loan_report_id,
			debt_facility_id = debt_facility_id,
			debt_facility_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY
		))

		session.add(models.Loan( # type: ignore
			id = uuid.uuid4(),
			company_id = company_id,
			loan_report_id = loan_report_id,
			amount = Decimal(10000.00),
			approved_at = get_relative_date(TODAY, -92),
			origination_date = get_relative_date(TODAY, -90),
			maturity_date = get_relative_date(TODAY, -40),
			adjusted_maturity_date = get_relative_date(TODAY, -40)
		))

	def test_for_unexpired_company_waiver(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())
			self.setup_data_for_unexpired_company_waiver_test(session, company_id, debt_facility_id)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 0)
			self.assertEqual(companies_updated_count, 0)

	def test_for_expired_company_waiver(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())
			self.setup_data_for_expired_company_waiver_test(session, company_id, debt_facility_id)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 2)
			self.assertEqual(companies_updated_count, 1)

	def test_for_unexpired_loan_waiver(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())
			self.setup_data_for_unexpired_loan_waiver_test(session, company_id, debt_facility_id)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 0)
			self.assertEqual(companies_updated_count, 0)

	def test_for_expired_loan_waiver(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())
			self.setup_data_for_expired_loan_waiver_test(session, company_id, debt_facility_id)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 1)
			self.assertEqual(companies_updated_count, 1)

	def test_for_no_company_or_loan_waivers(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())
			self.setup_data_for_no_company_or_loan_waivers_test(session, company_id, debt_facility_id)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 1)
			self.assertEqual(companies_updated_count, 1)

	def test_for_multiple_cases_mixed_companies(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id1 = str(uuid.uuid4())
			company_id2 = str(uuid.uuid4())
			company_id3 = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())

			self.setup_data_for_unexpired_company_waiver_test(
				session,
				company_id1,
				debt_facility_id
			)
			self.setup_data_for_expired_company_waiver_test(
				session, 
				company_id1,
				debt_facility_id,
				setup_company = False,
				setup_debt_facility = False
			)
			self.setup_data_for_unexpired_loan_waiver_test(
				session,
				company_id2,
				debt_facility_id,
				setup_debt_facility = False
			)
			self.setup_data_for_expired_loan_waiver_test(
				session,
				company_id3,
				debt_facility_id,
				setup_debt_facility = False
			)
			self.setup_data_for_no_company_or_loan_waivers_test(
				session,
				company_id3,
				debt_facility_id,
				setup_company = False,
				setup_debt_facility = False
			)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			# 2 is expected here, not 4, because we did not setup a company in the 
			# setup_data_for_expired_company_waiver_test function
			self.assertEqual(loans_updated_count, 2)
			# 1 is expected here, not 3, because we dit not setup a company in the
			# test_for_expired_company_waiver or test_for_no_company_or_loan_waivers functions
			self.assertEqual(companies_updated_count, 1)

	def test_for_multiple_cases_individual_companies(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id1 = str(uuid.uuid4())
			company_id2 = str(uuid.uuid4())
			company_id3 = str(uuid.uuid4())
			company_id4 = str(uuid.uuid4())
			company_id5 = str(uuid.uuid4())
			debt_facility_id = str(uuid.uuid4())

			self.setup_data_for_unexpired_company_waiver_test(
				session,
				company_id1,
				debt_facility_id
			)
			self.setup_data_for_expired_company_waiver_test(
				session,
				company_id2,
				debt_facility_id,
				setup_debt_facility = False
			)
			self.setup_data_for_unexpired_loan_waiver_test(
				session,
				company_id3,
				debt_facility_id,
				setup_debt_facility = False
			)
			self.setup_data_for_expired_loan_waiver_test(
				session,
				company_id4,
				debt_facility_id,
				setup_debt_facility = False
			)
			self.setup_data_for_no_company_or_loan_waivers_test(
				session,
				company_id5,
				debt_facility_id,
				setup_debt_facility = False
			)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 4)
			self.assertEqual(companies_updated_count, 3)

	def test_for_multiple_cases_individual_companies_mixed_debt_facilities(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id1 = str(uuid.uuid4())
			company_id2 = str(uuid.uuid4())
			company_id3 = str(uuid.uuid4())
			company_id4 = str(uuid.uuid4())
			company_id5 = str(uuid.uuid4())
			debt_facility_id1 = str(uuid.uuid4())
			debt_facility_id2 = str(uuid.uuid4())
			debt_facility_id3 = str(uuid.uuid4())

			self.setup_data_for_unexpired_company_waiver_test(
				session,
				company_id1,
				debt_facility_id1
			)
			self.setup_data_for_expired_company_waiver_test(
				session,
				company_id2,
				debt_facility_id1,
				setup_debt_facility = False
			)
			self.setup_data_for_unexpired_loan_waiver_test(
				session,
				company_id3,
				debt_facility_id2
			)
			self.setup_data_for_expired_loan_waiver_test(
				session,
				company_id4,
				debt_facility_id2,
				setup_debt_facility = False
			)
			self.setup_data_for_no_company_or_loan_waivers_test(
				session,
				company_id5,
				debt_facility_id3
			)

			loans_updated_count, companies_updated_count = debt_facility_util.check_past_due_loans(session, TODAY_DATE)
			self.assertEqual(loans_updated_count, 4)
			self.assertEqual(companies_updated_count, 3)
