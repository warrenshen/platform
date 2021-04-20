# Tests approval_util approval_util.py
import datetime
import decimal
import json
import uuid
from typing import Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import LoanStatusEnum, LoanTypeEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper

def _get_financial_summary(total_limit: float, available_limit: float) -> models.FinancialSummary:
	return models.FinancialSummary(
		total_limit=decimal.Decimal(total_limit),
		adjusted_total_limit=decimal.Decimal(total_limit),
		total_outstanding_principal=decimal.Decimal(0.0),
		total_outstanding_principal_for_interest=decimal.Decimal(0.0),
		total_outstanding_interest=decimal.Decimal(0.0), # unused
		total_outstanding_fees=decimal.Decimal(0.0), # unused
		total_principal_in_requested_state=decimal.Decimal(0.0), # unused
		interest_accrued_today=decimal.Decimal(0.0), # unused
		available_limit=decimal.Decimal(available_limit),
		minimum_monthly_payload={},
		account_level_balance_payload={}
	)

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

def _get_contract(product_type: str) -> models.Contract:
	return models.Contract(
		product_type=product_type,
		product_config=contract_test_helper.create_contract_config(
			product_type=product_type,
			input_dict=ContractInputDict(
				interest_rate=5.00,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=0, # unused
				late_fee_structure=_get_late_fee_structure(), # unused
			)
		)
	)

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

		with session_scope(session_maker) as session:
			resp, err = approval_util.submit_for_approval(
				loan_id=loan_id,
				session=session,
				triggered_by_autofinancing=False
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
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0,
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
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0
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
			'financial_summary': _get_financial_summary(
				total_limit=1000.0,
				available_limit=200.0
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
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0
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
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0,
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

class TestApproveLoans(db_unittest.TestCase):

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
		bank_admin_user_id = seed.get_company_id('bank_admin', index=0)

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

		approve_resp, err = approval_util.approve_loans(
			req={'loan_ids': [loan_id]},
			bank_admin_user_id=bank_admin_user_id,
			session_maker=session_maker
		)

		if test.get('in_err_msg'):
			# Checks the err msg for the approve_loans method
			self.assertIn(test['in_err_msg'], err.msg if err else '')
			return

		self.assertIsNone(err)

		with session_scope(session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id
				).first()
			)
			self.assertIsNotNone(loan)
			self.assertIsNotNone(loan.approved_at)
			self.assertEqual(bank_admin_user_id, loan.approved_by_user_id)
			self.assertIsNone(loan.rejected_at)
			self.assertEqual(LoanStatusEnum.APPROVED, loan.status)


	def test_approve_loan_failure_exceeds_available_limit(self) -> None:
		test: Dict = {
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=10.0
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(50.02),
					status=LoanStatusEnum.APPROVAL_REQUESTED,
					requested_at=date_util.now()
				)
			],
			'loan_index': 0,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			)],
			'loan_artifact_indices': [0],
			'in_err_msg': 'exceeds the maximum limit'
		}
		self._run_test(test)

	def test_approve_loan_failure_exceeds_artifact_limit(self) -> None:
		test: Dict = {
			'financial_summary': _get_financial_summary(
				total_limit=500.0,
				available_limit=300.0
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(150.02),
					status=LoanStatusEnum.APPROVAL_REQUESTED,
					requested_at=date_util.now()
				)
			],
			'loan_index': 0,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			)],
			'loan_artifact_indices': [0],
			'in_err_msg': 'over the amount granted'
		}
		self._run_test(test)

	def test_approve_loan_success(self) -> None:
		test: Dict = {
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0,
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(50.02),
					status=LoanStatusEnum.APPROVAL_REQUESTED,
					requested_at=date_util.now()
				)
			],
			'loan_index': 0,
			'artifacts': [models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			)],
			'loan_artifact_indices': [0],
		}
		self._run_test(test)

class TestSubmitViaAutoFinancing(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		financial_summary = test['financial_summary'] # Financial summary registered in the system
		company_settings = test['company_settings']
		contract = test['contract']
		artifact = test['artifact'] # Artifacts registered in the system
		artifact_id = None
		artifact_amount = None
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(session_maker) as session:

			financial_summary.company_id = company_id
			session.add(financial_summary)

			company_settings.company_id = company_id
			session.add(company_settings)

			contract.company_id = company_id
			session.add(contract)

			artifact.company_id = company_id
			session.add(artifact)
			session.flush()
			artifact_id = str(artifact.id)
			artifact_amount = float(artifact.amount)

			company = cast(models.Company, session.query(models.Company).filter_by(
				id=company_id
			).first())
			company.contract_id = str(contract.id)
			company.company_settings_id = str(company_settings.id)

		with session_scope(session_maker) as session:
			resp, err = approval_util.submit_for_approval_if_has_autofinancing(
				company_id=company_id,
				amount=artifact_amount,
				artifact_id=artifact_id,
				session=session
			)
			if test.get('in_err_msg'):
				self.assertIn(test['in_err_msg'], err.msg if err else '')
				return

		self.assertIsNone(err)

		if test['expect_no_loan']:
			self.assertIsNone(resp)
			return

		expected = test['expected_loan']
		with session_scope(session_maker) as session:
			loan_id = resp['loan_id']
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id
				).first()
			)
			self.assertIsNotNone(loan)
			self.assertIsNotNone(loan.requested_at)
			self.assertEqual(LoanStatusEnum.APPROVAL_REQUESTED, loan.status)

			self.assertEqual(company_id, loan.company_id)
			self.assertEqual(expected.identifier, loan.identifier)
			self.assertEqual(expected.loan_type, loan.loan_type)
			self.assertEqual(artifact_id, str(loan.artifact_id))
			self.assertAlmostEqual(float(expected.amount), float(loan.amount))
			self.assertIsNotNone(loan.requested_payment_date)

	def test_has_no_autofinancing(self) -> None:

		test: Dict = {
			'contract': _get_contract(product_type=ProductType.INVENTORY_FINANCING),
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0,
			),
			'company_settings': models.CompanySettings(),
			'artifact': models.PurchaseOrder(
				amount=decimal.Decimal(100.0)
			),
			'expect_no_loan': True
		}
		self._run_test(test)

	def test_has_autofinancing(self) -> None:

		test: Dict = {
			'contract': _get_contract(product_type=ProductType.INVENTORY_FINANCING),
			'financial_summary': _get_financial_summary(
				total_limit=200.0,
				available_limit=200.0,
			),
			'company_settings': models.CompanySettings(
				has_autofinancing=True
			),
			'artifact': models.PurchaseOrder(
				amount=decimal.Decimal(100.1)
			),
			'expect_no_loan': False,
			'expected_loan': models.Loan(
				identifier='1',
				loan_type=LoanTypeEnum.INVENTORY,
				amount=decimal.Decimal(100.1)
			)
		}
		self._run_test(test)
