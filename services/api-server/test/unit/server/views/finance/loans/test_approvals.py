import datetime
import decimal
import uuid
from typing import cast, List, Dict

from bespoke.db import models, db_constants
from bespoke.db.db_constants import LoanStatusEnum
from bespoke.db.models import session_scope
from bespoke.finance.loans import approval_util
from bespoke.finance import number_util
from bespoke.date import date_util

from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

# TODO(warren): Add a test for approve loan

class TestSubmitForApproval(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		financial_summary = test['financial_summary'] # Financial summary registered in the system
		loans = test['loans'] # Loans registered in the system
		artifacts = test['artifacts'] # Artifacts registered in the system
		artifact_indices = test['loan_artifact_indices'] # Parallel array to test['loans'], describes which artifact index in test['artifacts'] this loan is associated with

		loan_ids = []
		artifact_ids = []
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(session_maker) as session:

			financial_summary.company_id = company_id
			session.add(financial_summary)

			for i in range(len(artifacts)):
				artifact = artifacts[i]
				artifact.company_id = company_id
				session.add(artifact)
				session.flush()
				artifact_ids.append(str(artifact.id))

			for i in range(len(loans)):
				loan = loans[i]
				loan.company_id = company_id
				loan.artifact_id = artifact_ids[artifact_indices[i]]
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		if test['loan_index'] is None:
			loan_id = str(uuid.uuid4())
		else:
			loan_id = loan_ids[test['loan_index']]

		resp, err = approval_util.submit_for_approval(
			loan_id=loan_id,
			session_maker=session_maker
		)
		if test.get('in_err_msg'):
			self.assertIn(test['in_err_msg'], err.msg if err else '')
			return

		self.assertIsNone(err)
		self.assertIsNotNone(resp['customer_name'])
		self.assertIsNotNone(resp['loan_html'])

		with session_scope(session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id
				).first()
			)
			self.assertIsNotNone(loan)
			self.assertIsNotNone(loan.requested_at)
			self.assertEqual(LoanStatusEnum.APPROVAL_REQUESTED, loan.status)

	def test_failure_no_loan(self) -> None:
		test: Dict = {
			'financial_summary': models.FinancialSummary(
				total_limit=decimal.Decimal(200.0),
				adjusted_total_limit=decimal.Decimal(200.0),
				total_outstanding_principal=decimal.Decimal(0.0),
				total_outstanding_principal_for_interest=decimal.Decimal(0.0),
				total_outstanding_interest=decimal.Decimal(0.0), # unused
				total_outstanding_fees=decimal.Decimal(0.0), # unused
				total_principal_in_requested_state=decimal.Decimal(0.0), # unused
				interest_accrued_today=decimal.Decimal(0.0), # unused
				available_limit=decimal.Decimal(200.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			),
			'loans': [],
			'loan_index': None,
			'artifacts': [],
			'loan_artifact_indices': [],
			'in_err_msg': 'not find loan'
		}
		self._run_test(test)

	def test_too_many_loans_from_one_purchase_order(self) -> None:
		test: Dict = {
			'financial_summary': models.FinancialSummary(
				total_limit=decimal.Decimal(200.0),
				adjusted_total_limit=decimal.Decimal(200.0),
				total_outstanding_principal=decimal.Decimal(0.0),
				total_outstanding_principal_for_interest=decimal.Decimal(0.0),
				total_outstanding_interest=decimal.Decimal(0.0), # unused
				total_outstanding_fees=decimal.Decimal(0.0), # unused
				total_principal_in_requested_state=decimal.Decimal(0.0), # unused
				interest_accrued_today=decimal.Decimal(0.0), # unused
				available_limit=decimal.Decimal(200.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(40.02),
					status=db_constants.LoanStatusEnum.APPROVAL_REQUESTED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(30.02),
					status=db_constants.LoanStatusEnum.APPROVED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(20.02),
					status=db_constants.LoanStatusEnum.APPROVED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(50.02),
					status=db_constants.LoanStatusEnum.CLOSED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/02/2020'),
					amount=decimal.Decimal(10.00)
				)
				# Many loans in several states add up to more than the $100 allotted for that
				# one purchase order when summed up.
			],
			'loan_index': 4,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			)],
			'loan_artifact_indices': [0, 0, 0, 0, 0],
			'in_err_msg': 'over the amount'
		}
		self._run_test(test)

	def test_failure_hit_max_limit_allowed(self) -> None:

		test: Dict = {
			'financial_summary': models.FinancialSummary(
				total_limit=decimal.Decimal(1000.0),
				adjusted_total_limit=decimal.Decimal(1000.0),
				total_outstanding_principal=decimal.Decimal(0.0),
				total_outstanding_principal_for_interest=decimal.Decimal(0.0),
				total_outstanding_interest=decimal.Decimal(0.0), # unused
				total_outstanding_fees=decimal.Decimal(0.0), # unused
				total_principal_in_requested_state=decimal.Decimal(0.0), # unused
				interest_accrued_today=decimal.Decimal(0.0), # unused
				available_limit=decimal.Decimal(200.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(300.02)
				)
			],
			'loan_index': 0,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(900.0)
			)],
			'loan_artifact_indices': [0],
			'in_err_msg': 'exceeds the maximum limit'
		}
		self._run_test(test)

	def test_sucess_many_loans_from_one_purchase_order_draft_doesnt_count(self) -> None:
		test: Dict = {
			'financial_summary': models.FinancialSummary(
				total_limit=decimal.Decimal(200.0),
				adjusted_total_limit=decimal.Decimal(200.0),
				total_outstanding_principal=decimal.Decimal(0.0),
				total_outstanding_principal_for_interest=decimal.Decimal(0.0),
				total_outstanding_interest=decimal.Decimal(0.0), # unused
				total_outstanding_fees=decimal.Decimal(0.0), # unused
				total_principal_in_requested_state=decimal.Decimal(0.0), # unused
				interest_accrued_today=decimal.Decimal(0.0), # unused
				available_limit=decimal.Decimal(200.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(50.02),
					status=db_constants.RequestStatusEnum.DRAFTED # doesnt count against quota
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(90.02),
					status=db_constants.RequestStatusEnum.REJECTED # doesnt count against quota
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/02/2020'),
					amount=decimal.Decimal(80.02)
				)
				# Two loans are requested which add up to 130.02 but one is in drafted state
				# so it doesn't count against your quota
			],
			'loan_index': 2,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			)],
			'loan_artifact_indices': [0, 0, 0]
		}
		self._run_test(test)

	def test_success_inventory_loan(self) -> None:

		test: Dict = {
			'financial_summary': models.FinancialSummary(
				total_limit=decimal.Decimal(200.0),
				adjusted_total_limit=decimal.Decimal(200.0),
				total_outstanding_principal=decimal.Decimal(0.0),
				total_outstanding_principal_for_interest=decimal.Decimal(0.0),
				total_outstanding_interest=decimal.Decimal(0.0), # unused
				total_outstanding_fees=decimal.Decimal(0.0), # unused
				total_principal_in_requested_state=decimal.Decimal(0.0), # unused
				interest_accrued_today=decimal.Decimal(0.0), # unused
				available_limit=decimal.Decimal(200.0),
				minimum_monthly_payload={},
				account_level_balance_payload={}
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(50.02)
				)
			],
			'loan_index': 0,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			)],
			'loan_artifact_indices': [0],
		}
		self._run_test(test)
