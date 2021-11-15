import datetime
import decimal
import uuid
from typing import Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import LoanStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.loans import artifacts_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper


def _get_default_contract(advance_rate: float) -> models.Contract:
	return models.Contract(
		product_type=ProductType.INVOICE_FINANCING,
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.INVOICE_FINANCING,
			input_dict=ContractInputDict(
				advance_rate=advance_rate,
				wire_fee=25.0,
				interest_rate=0.05,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=120,
				late_fee_structure='', # unused
				preceeding_business_day=False
			)
		)
	)

class TestListArtifactsForCreateLoan(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		loans = test['loans'] # Loans registered in the system
		artifacts = test['artifacts'] # Artifacts registered in the system
		artifact_indices = test['loan_artifact_indices'] # Parallel array to test['loans'], describes which artifact index in test['artifacts'] this loan is associated with

		product_type = test['product_type']
		company_id = seed.get_company_id('company_admin', index=0)

		loan_ids = []
		artifact_ids = []
		with session_scope(session_maker) as session:
			if 'contract' in test:
				contract = test['contract']
				contract.company_id = company_id

				session.add(contract)
				session.flush()
				contract_id = str(contract.id)

				company = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.id == company_id
					).first())
				company.contract_id = contract_id
				session.flush()

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

		loan_id = None
		if test.get('loan_id_index') is not None:
			loan_id = loan_ids[test['loan_id_index']]

		resp, err = artifacts_util.list_artifacts_for_create_loan(
			company_id=company_id,
			product_type=product_type,
			loan_id=loan_id,
			session_maker=session_maker
		)
		if test.get('in_err_msg'):
			self.assertIn(test['in_err_msg'], err.msg if err else '')
			return

		self.assertIsNone(err)
		self.assertEqual(len(test['expected_artifacts']), len(resp['artifacts']))
		resp['artifacts'].sort(key=lambda a: a['total_amount'])

		for i in range(len(resp['artifacts'])):
			test['expected_artifacts'][i]['artifact_id'] = artifact_ids[i]
			test_helper.assertDeepAlmostEqual(
				self, test['expected_artifacts'][i], cast(Dict, resp['artifacts'][i]))

	def test_success_no_artifacts(self) -> None:
		test: Dict = {
			'product_type': db_constants.ProductType.INVENTORY_FINANCING,
			'loans': [],
			'loan_id_index': None,
			'artifacts': [],
			'loan_artifact_indices': [],
			'expected_artifacts': []
		}
		self._run_test(test)

	def test_inventory_financing_many_loans_from_two_purchase_orders(self) -> None:
		test: Dict = {
			'product_type': db_constants.ProductType.INVENTORY_FINANCING,
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(90.02),
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
					amount=decimal.Decimal(10.01)
				)
				# Many loans in several states add up to more than the $100 allotted for that
				# one purchase order when summed up.
			],
			'artifacts': [
				models.PurchaseOrder(
					amount=decimal.Decimal(100.0)
				),
				models.PurchaseOrder(
					amount=decimal.Decimal(200.0)
				),
				models.PurchaseOrder(
					amount=decimal.Decimal(300.0)
				)
			],
			'loan_artifact_indices': [0, 0, 0, 1, 1],
			'loan_id_index': None,
			'expected_artifacts': [
				{
					'artifact_id': None, # filled in by test
					'total_amount': 100.0,
					'amount_remaining': 0 # would normally send the amount remaining negative
				},
				{
					'artifact_id': None, # filled in by test
					'total_amount': 200.0,
					'amount_remaining': 200.0 - (50.02 + 10.01)
				},
				{
					'artifact_id': None, # filled in by test
					'total_amount': 300.0,
					'amount_remaining': 300.0 # no loans associated with this artifact
				}
			]
		}
		self._run_test(test)

	def test_inventory_financing_exclude_loan_id(self) -> None:
		test: Dict = {
			'product_type': db_constants.ProductType.INVENTORY_FINANCING,
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(200.02),
					status=db_constants.LoanStatusEnum.APPROVAL_REQUESTED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(130.02),
					status=db_constants.LoanStatusEnum.APPROVED
				)
			],
			'artifacts': [
				models.PurchaseOrder(
					amount=decimal.Decimal(700.0)
				),
			],
			'loan_artifact_indices': [0, 0],
			'loan_id_index': 0,
			'expected_artifacts': [
				{
					'artifact_id': None, # filled in by test
					'total_amount': 700.0,
					'amount_remaining': 700.0 - 130.02 # check that your loan (200.02 amount) is not included
				}
			]
		}
		self._run_test(test)

	def test_inventory_financing_exclude_deleted_loan(self) -> None:
		test: Dict = {
			'product_type': db_constants.ProductType.INVENTORY_FINANCING,
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(200.02),
					status=db_constants.LoanStatusEnum.APPROVAL_REQUESTED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(130.02),
					status=db_constants.LoanStatusEnum.APPROVED,
					is_deleted=True,
				)
			],
			'artifacts': [
				models.PurchaseOrder(
					amount=decimal.Decimal(700.0)
				),
			],
			'loan_artifact_indices': [0, 0],
			'loan_id_index': 0,
			'expected_artifacts': [
				{
					'artifact_id': None, # filled in by test
					'total_amount': 700.0,
					'amount_remaining': 700.0,
				}
			]
		}
		self._run_test(test)

	def test_dispensary_financing_exclude_deleted_loan(self) -> None:
		test: Dict = {
			'product_type': db_constants.ProductType.DISPENSARY_FINANCING,
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(200.02),
					status=db_constants.LoanStatusEnum.APPROVAL_REQUESTED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVENTORY,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(130.02),
					status=db_constants.LoanStatusEnum.APPROVED,
					is_deleted=True,
				)
			],
			'artifacts': [
				models.PurchaseOrder(
					amount=decimal.Decimal(700.0)
				),
			],
			'loan_artifact_indices': [0, 0],
			'loan_id_index': 0,
			'expected_artifacts': [
				{
					'artifact_id': None, # filled in by test
					'total_amount': 700.0,
					'amount_remaining': 700.0,
				}
			]
		}
		self._run_test(test)

	def test_invoice_financing_many_loans_from_two_purchase_orders(self) -> None:
		ADVANCE_RATE = 0.8

		test: Dict = {
			'product_type': db_constants.ProductType.INVOICE_FINANCING,
			'contract': _get_default_contract(
				advance_rate=ADVANCE_RATE
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(90.02),
					status=db_constants.LoanStatusEnum.APPROVAL_REQUESTED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(30.02),
					status=db_constants.LoanStatusEnum.APPROVED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(20.02),
					status=db_constants.LoanStatusEnum.APPROVED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(50.02),
					status=db_constants.LoanStatusEnum.CLOSED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/02/2020'),
					amount=decimal.Decimal(10.01)
				)
				# Many loans in several states add up to more than the $100 allotted for that
				# one purchase order when summed up.
			],
			'artifacts': [
				models.Invoice(
					subtotal_amount=decimal.Decimal(100.0)
				),
				models.Invoice(
					subtotal_amount=decimal.Decimal(200.0)
				),
				models.Invoice(
					subtotal_amount=decimal.Decimal(300.0)
				)
			],
			'loan_artifact_indices': [0, 0, 0, 1, 1],
			'loan_id_index': None,
			'expected_artifacts': [
				{
					'artifact_id': None, # filled in by test
					'total_amount': 100.0 * ADVANCE_RATE,
					'amount_remaining': 0.0 # would normally send the amount remaining negative
				},
				{
					'artifact_id': None, # filled in by test
					'total_amount': 200.0 * ADVANCE_RATE,
					'amount_remaining': (200.0 * ADVANCE_RATE) - (50.02 + 10.01)
				},
				{
					'artifact_id': None, # filled in by test
					'total_amount': 300.0 * ADVANCE_RATE,
					'amount_remaining': 300.0 * ADVANCE_RATE # no loans associated with this artifact
				}
			]
		}
		self._run_test(test)

	def test_invoice_financing_exclude_loan_id(self) -> None:
		ADVANCE_RATE = 0.8

		test: Dict = {
			'product_type': db_constants.ProductType.INVOICE_FINANCING,
			'contract': _get_default_contract(
				advance_rate=ADVANCE_RATE
			),
			'loans': [
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(200.02),
					status=db_constants.LoanStatusEnum.APPROVAL_REQUESTED
				),
				models.Loan(
					loan_type=db_constants.LoanTypeEnum.INVOICE,
					requested_payment_date=date_util.load_date_str('10/01/2020'),
					amount=decimal.Decimal(130.02),
					status=db_constants.LoanStatusEnum.APPROVED
				)
			],
			'artifacts': [
				models.Invoice(
					subtotal_amount=decimal.Decimal(700.0)
				),
			],
			'loan_artifact_indices': [0, 0],
			'loan_id_index': 0,
			'expected_artifacts': [
				{
					'artifact_id': None, # filled in by test
					'total_amount': 700.0 * ADVANCE_RATE,
					'amount_remaining': (700.0 * ADVANCE_RATE) - 130.02 # check that your loan (200.02 amount) is not included
				}
			]
		}
		self._run_test(test)
