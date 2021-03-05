import json
import datetime
import decimal
from base64 import b64encode
from typing import Callable, Dict, Any
from dataclasses import dataclass

from manage import app
from bespoke.db.db_constants import RequestStatusEnum, LoanStatusEnum
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper
from bespoke_test import auth_helper
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from sqlalchemy.orm.session import Session


@dataclass
class PurchaseOrderConfig:
	id: str
	amount: float


class TestUpsertPurchaseOrdersLoansView(db_unittest.TestCase):

	purchase_orders = (
		PurchaseOrderConfig('00000000-0000-0000-0000-000000000000', 10000),
		PurchaseOrderConfig('00000000-0000-0000-0000-000000000001', 50000),
		PurchaseOrderConfig('00000000-0000-0000-0000-000000000002', 100000),
	)

	def _get_request_headers(self, user_id: str) -> Dict:
		with app.app_context():
			with session_scope(self.session_maker) as session:
				headers = auth_helper.get_user_auth_headers(session, user_id)
				headers.update({"Content-Type": "application/json"})
				return headers

	def _setup(self) -> test_helper.BasicSeed:
		seed = self.seed_database()
		company_id = seed.get_company_id('company_admin', index=0)

		for purchase_order in self.purchase_orders:
			with session_scope(self.session_maker) as session:
				session.add(models.PurchaseOrder( # type: ignore
					id=purchase_order.id,
					company_id=company_id,
					amount=decimal.Decimal(purchase_order.amount),
					status=RequestStatusEnum.APPROVED,
				))
		return seed

	def _make_request(self, seed: test_helper.BasicSeed, request: Dict) -> Dict:
		user_id = str(seed.data['company_admins'][0]["user"]["user_id"])
		headers = self._get_request_headers(user_id)

		with app.test_client() as client:
			response = client.post("/finance/loans/purchase_orders/upsert",
				data=json.dumps(request),
				headers=headers)
			return json.loads(response.data)

	def _run_simple_test(self, request: Any) -> Dict:
		seed = self._setup()
		return self._make_request(seed, request)

	def _run_test_with_populate(self, populate: Callable, request: Dict) -> Dict:
		seed = self._setup()
		with session_scope(self.session_maker) as session:
			populate(seed, session)
		return self._make_request(seed, request)

	def test_request_validations(self) -> None:
		tests = [
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
				},
				"err_contains": "'data' must be an array",
			},
			{
				"request": {
					"data": [1, 2, 3],
				},
				"err_contains": "missing key: 'status'",
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVED,
					"data": [1, 2, 3],
				},
				"err_contains": "not a valid status",
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [],
				},
				"err_contains": "'data' is empty",
			},
			{
				"request": {
					"status": LoanStatusEnum.DRAFTED,
					"data": [
						{
							"loan": {"id": "fake-id"},
						}
					]
				},
				"err_contains": "'artifact' is not an object",
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [
						{
							"loan": {"id": "fake-id"},
							"artifact": {"id": None},
						}
					]
				},
				"err_contains": "artifacts must have an id"
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [
						{
							"loan": {
								"id": "fake-id",
								"amount": 100,
								"requested_payment_date": "03/04/2021",
							},
							"artifact": {"id": "fake-id"},
						},
						{
							"loan": {
								"id": "fake-id",
								"amount": 100,
								"requested_payment_date": "03/04/2021",
							},
							"artifact": {"id": "fake-id"},
						}
					]
				},
				"err_contains": "each artifact id must be unique"
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [
						{
							"loan": {
								"id": "fake-id",
								"amount": 100,
								"requested_payment_date": "03/04/2021",
							},
							"artifact": {"id": "fake-id-1"},
						},
						{
							"loan": {
								"id": "fake-id",
								"amount": 100,
								"requested_payment_date": "03/04/2021",
							},
							"artifact": {"id": "fake-id-2"},
						}
					]
				},
				"err_contains": "unique loan.id"
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [
						{
							"loan": {
								"id": "fake-id",
								"amount": 0,
								"requested_payment_date": "03/04/2021",
							},
							"artifact": {"id": "fake-id-2"},
						}
					]
				},
				"err_contains": "no loan amount"
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [
						{
							"loan": {
								"id": "fake-id",
								"amount": -10.0,
								"requested_payment_date": "03/04/2021",
							},
							"artifact": {"id": "fake-id-2"},
						}
					]
				},
				"err_contains": "non-positive"
			},
			{
				"request": {
					"status": LoanStatusEnum.APPROVAL_REQUESTED,
					"data": [
						{
							"loan": {
								"id": "fake-id",
								"amount": 1000,
								"requested_payment_date": "it's always march :P",
							},
							"artifact": {"id": "fake-id-2"},
						}
					]
				},
				"err_contains": "valid date"
			},
		]

		for test in tests:
			response = self._run_simple_test(test["request"])
			self.assertEqual(response["status"], "ERROR")
			self.assertIn(test["err_contains"], response["msg"])

	def test_model_permissions(self) -> None:
		def populate(seed: test_helper.BasicSeed, session: Session) -> None:
			company_id = seed.get_company_id('company_admin', index=1)
			session.add(models.PurchaseOrder( # type: ignore
				id='00000000-0000-0000-0000-000000000004',
				company_id=company_id,
				amount=decimal.Decimal(10000),
				status=RequestStatusEnum.APPROVED,
			))

		response = self._run_test_with_populate(populate, {
			"status": LoanStatusEnum.APPROVAL_REQUESTED,
			"data": [
				{
					"loan": {
						"amount": 100,
						"requested_payment_date": "03/04/2021",
					},
					"artifact": {
						"id": '00000000-0000-0000-0000-000000000004',
					},
				},
			]
		})

		self.assertEqual(response["status"], "ERROR")
		self.assertIn("Access Denied", response["msg"])

	def test_does_a_save(self) -> None:
		response = self._run_simple_test({
			"status": LoanStatusEnum.DRAFTED,
			"data": [
				{
					"loan": {
						"amount": 100,
						"requested_payment_date": "03/04/2021",
					},
					"artifact": {
						"id": self.purchase_orders[0].id,
					},
				},
				{
					"loan": {
						"amount": 100,
						"requested_payment_date": "03/04/2021",
					},
					"artifact": {
						"id": self.purchase_orders[1].id,
					},
				},
			]
		})

		self.assertEqual(response["status"], "OK")

		with session_scope(self.session_maker) as session:
			loans = session.query(models.Loan).all()
			self.assertEqual(len(loans), 2)
			artifact_ids = [str(loan.artifact_id) for loan in loans]
			self.assertEqual(set(artifact_ids), {self.purchase_orders[0].id, self.purchase_orders[1].id})





