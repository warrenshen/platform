import json
import datetime
from base64 import b64encode
from typing import Callable, Dict

from manage import app
from bespoke.db.db_constants import ProductType
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper
from bespoke_test import auth_helper
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from sqlalchemy.orm.session import Session



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


	def _get_request_headers(self, user_id: str) -> Dict:
		with app.app_context():
			with session_scope(self.session_maker) as session:
				headers = auth_helper.get_user_auth_headers(session, user_id)
				headers.update({"Content-Type": "application/json"})
				return headers


	def test_updates_contract(self) -> None:
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
						late_fee_structure=_get_late_fee_structure() # unused
					)
				)
			)
			session.add(contract)
			session.commit()
			session.refresh(contract)
			contract_id = contract.id

		headers = self._get_request_headers(str(seed.data['bank_admins'][0]["user"]["user_id"]))
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
			self.assertEqual(response_data["status"], "OK")

		with session_scope(self.session_maker) as session:
			company = session.query(models.Company).get(company_id)
			self.assertEqual(company.needs_balance_recomputed, True)

			contract = session.query(models.Contract).get(contract_id)
			self.assertEqual(contract.product_type, ProductType.LINE_OF_CREDIT)
