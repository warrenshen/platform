import datetime
import json
from typing import Dict, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke_test import auth_helper
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from manage import app

def _get_default_contract_config(overrides: Dict) -> Dict:
	contract_dict = ContractInputDict(
		maximum_principal_amount=120000.01,
		max_days_until_repayment=30,
		late_fee_structure=json.dumps({"1-2": 0.25, "3+": 0.5}),
	)

	d = cast(Dict, contract_dict)
	d.update(overrides)

	return contract_test_helper.create_contract_config(
		product_type=ProductType.INVENTORY_FINANCING,
		input_dict=cast(ContractInputDict, d)
	)

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

class TestUpdateContractView(db_unittest.TestCase):

	def _seed_database(self) -> test_helper.BasicSeed:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		return seed


	def _get_request_headers(self, user_id: str, company_id: str) -> Dict:
		with app.app_context():
			with session_scope(self.session_maker) as session:
				headers = auth_helper.get_user_auth_headers(session, user_id, company_id)
				headers.update({"Content-Type": "application/json"})
				return headers


	def test_update_contract(self) -> None:
		seed = self._seed_database()
		company_id = seed.get_company_id('company_admin', index=0)
		contract_id = None

		with session_scope(self.session_maker) as session:
			contract = models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=5.00,
						maximum_principal_amount=120000.01,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
					)
				)
			)
			session.add(contract)
			session.commit()
			session.refresh(contract)
			contract_id = contract.id

		headers = self._get_request_headers(str(seed.data['bank_admins'][0]["user"]["user_id"]), company_id)
		request_data = {
			"contract_id": str(contract_id),
			"contract_fields": {
				"product_type": ProductType.LINE_OF_CREDIT,
				"start_date": datetime.date.today().isoformat(),
				"end_date": datetime.date.today().isoformat(),
				"product_config": ""
			}
		}

		with app.test_client() as client:
			response = client.post("/contracts/update_contract",
				data=json.dumps(request_data),
				headers=headers)
			response_data = json.loads(response.data)
			# When the product config is empty, or invalid we produce an error due to a
			# validation check
			self.assertEqual(response_data["status"], "ERROR", msg=response_data.get('msg'))

		request_data = {
			"contract_id": str(contract_id),
			"contract_fields": {
				"product_type": ProductType.LINE_OF_CREDIT,
				"start_date": datetime.date.today().isoformat(),
				"end_date": datetime.date.today().isoformat(),
				"product_config": contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=5.00,
						maximum_principal_amount=120000.01,
						max_days_until_repayment=0,
						late_fee_structure=_get_late_fee_structure(),
					)
				)
			}
		}

		with app.test_client() as client:
			response = client.post("/contracts/update_contract",
				data=json.dumps(request_data),
				headers=headers)
			response_data = json.loads(response.data)
			self.assertEqual(response_data["status"], "OK", msg=response_data.get('msg'))

		with session_scope(self.session_maker) as session:
			contract = session.query(models.Contract).get(contract_id)
			self.assertEqual(contract.product_type, ProductType.LINE_OF_CREDIT)

class TestTerminateContractView(db_unittest.TestCase):

	def _seed_database(self) -> test_helper.BasicSeed:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		return seed


	def _get_request_headers(self, user_id: str, company_id: str) -> Dict:
		with app.app_context():
			with session_scope(self.session_maker) as session:
				headers = auth_helper.get_user_auth_headers(
					session,
					user_id,
					company_id,
				)
				headers.update({"Content-Type": "application/json"})
				return headers

	def test_terminate_contract_termination_date_after_dynamic_interest_rate_ranges(self) -> None:
		seed = self._seed_database()
		company_id = seed.get_company_id('company_admin', index=0)
		contract_id = None

		with session_scope(self.session_maker) as session:
			contract = models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				start_date=date_util.load_date_str('01/01/2020'),
				product_config=_get_default_contract_config({
					'dynamic_interest_rate': json.dumps({
						'01/01/2020-03/01/2020': 0.002,
						'03/02/2020-06/01/2020': 0.001,
					})
				}),
			)
			session.add(contract)
			session.commit()
			session.refresh(contract)
			contract_id = contract.id

		headers = self._get_request_headers(str(seed.data['bank_admins'][0]["user"]["user_id"]), company_id)
		request_data = {
			"contract_id": str(contract_id),
			"termination_date": '06/02/2020',
		}

		with app.test_client() as client:
			response = client.post("/contracts/terminate_contract",
				data=json.dumps(request_data),
				headers=headers,
			)
			response_data = json.loads(response.data)
			self.assertEqual(response_data["status"], "OK", msg=response_data.get('msg'))

		with session_scope(self.session_maker) as session:
			contract = session.query(models.Contract).get(contract_id)
			self.assertEqual(contract.product_type, ProductType.INVENTORY_FINANCING)
			self.assertEqual(contract.adjusted_end_date, date_util.load_date_str('06/02/2020'))

	def test_terminate_contract_termination_date_within_last_dynamic_interest_rate_range(self) -> None:
		seed = self._seed_database()
		company_id = seed.get_company_id('company_admin', index=0)
		contract_id = None

		with session_scope(self.session_maker) as session:
			contract = models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				start_date=date_util.load_date_str('01/01/2020'),
				product_config=_get_default_contract_config({
					'dynamic_interest_rate': json.dumps({
						'01/01/2020-03/01/2020': 0.002,
						'03/02/2020-06/01/2020': 0.001,
					})
				}),
			)
			session.add(contract)
			session.commit()
			session.refresh(contract)
			contract_id = contract.id

		headers = self._get_request_headers(str(seed.data['bank_admins'][0]["user"]["user_id"]), company_id)
		request_data = {
			"contract_id": str(contract_id),
			"termination_date": '03/03/2020',
		}

		with app.test_client() as client:
			response = client.post("/contracts/terminate_contract",
				data=json.dumps(request_data),
				headers=headers,
			)
			response_data = json.loads(response.data)
			self.assertEqual(response_data["status"], "OK", msg=response_data.get('msg'))

		with session_scope(self.session_maker) as session:
			contract = session.query(models.Contract).get(contract_id)
			self.assertEqual(contract.product_type, ProductType.INVENTORY_FINANCING)
			self.assertEqual(contract.adjusted_end_date, date_util.load_date_str('03/03/2020'))

	def test_terminate_contract_termination_date_within_first_dynamic_interest_rate_range(self) -> None:
		seed = self._seed_database()
		company_id = seed.get_company_id('company_admin', index=0)
		contract_id = None

		with session_scope(self.session_maker) as session:
			contract = models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				start_date=date_util.load_date_str('01/01/2020'),
				product_config=_get_default_contract_config({
					'dynamic_interest_rate': json.dumps({
						'01/01/2020-03/01/2020': 0.002,
						'03/02/2020-06/01/2020': 0.001,
					})
				}),
			)
			session.add(contract)
			session.commit()
			session.refresh(contract)
			contract_id = contract.id

		headers = self._get_request_headers(str(seed.data['bank_admins'][0]["user"]["user_id"]), company_id)
		request_data = {
			"contract_id": str(contract_id),
			"termination_date": '02/20/2020',
		}

		with app.test_client() as client:
			response = client.post("/contracts/terminate_contract",
				data=json.dumps(request_data),
				headers=headers,
			)
			response_data = json.loads(response.data)
			self.assertEqual(response_data["status"], "OK", msg=response_data.get('msg'))

		with session_scope(self.session_maker) as session:
			contract = session.query(models.Contract).get(contract_id)
			self.assertEqual(contract.product_type, ProductType.INVENTORY_FINANCING)
			self.assertEqual(contract.adjusted_end_date, date_util.load_date_str('02/20/2020'))
