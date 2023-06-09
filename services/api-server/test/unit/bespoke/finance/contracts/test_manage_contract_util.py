import json
from typing import Dict, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.finance.contracts import manage_contract_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper

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

class TestAddNewContract(db_unittest.TestCase):

	def test_success_no_previous_contracts(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin')
		contract_fields = manage_contract_util.ContractFieldsDict(
				product_type=ProductType.INVENTORY_FINANCING,
				start_date='01/01/2020',
				end_date='06/01/2020',
				product_config=_get_default_contract_config({
					'interest_rate': 0.05
				})
			)
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=contract_fields
		)
		user_id = seed.get_user_id('bank_admin')

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		with session_scope(session_maker) as session:
			# Get the contract which just got setup for this company.
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
				).first())
			self.assertIsNotNone(company)
			self.assertIsNotNone(company.contract_id)

			cur_contract = cast(
				models.Contract,
				session.query(models.Contract).filter(
					models.Contract.id == company.contract_id
				).first())
			self.assertIsNotNone(cur_contract)

			# Validate the contract
			self.assertEqual(contract_fields['product_type'], cur_contract.product_type)
			self.assertEqual(contract_fields['product_config'], cur_contract.product_config)
			self.assertEqual(contract_fields['start_date'], date_util.date_to_str(cur_contract.start_date))
			self.assertEqual(contract_fields['end_date'], date_util.date_to_str(cur_contract.end_date))
			self.assertEqual(contract_fields['end_date'], date_util.date_to_str(cur_contract.adjusted_end_date))
			self.assertEqual(user_id, str(cur_contract.modified_by_user_id))

	def test_failure_no_overlapping_contract_dates(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		def _get_contract_fields(start_date: str, end_date: str) -> manage_contract_util.ContractFieldsDict:
			contract_fields = manage_contract_util.ContractFieldsDict(
					product_type=ProductType.INVENTORY_FINANCING,
					start_date=start_date,
					end_date=end_date,
					product_config=_get_default_contract_config({
						'interest_rate': 0.05
					})
				)
			return contract_fields

		company_id = seed.get_company_id('company_admin')
		user_id = seed.get_user_id('bank_admin')

		# First one success, no other contracts exist yet
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='01/01/2020',
				end_date='06/01/2020'
			)
		)

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		# Second one success, no overlap
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='07/01/2020',
				end_date='10/01/2020'
			)
		)

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		# Third one fails because of overlap with first date
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='06/01/2020',
				end_date='06/02/2020'
			)
		)

		success, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(err)

class TestUpdateContract(db_unittest.TestCase):

	def test_successful_update_simple_interest_only(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		def _get_contract_fields(start_date: str, end_date: str) -> manage_contract_util.ContractFieldsDict:
			contract_fields = manage_contract_util.ContractFieldsDict(
					product_type=ProductType.INVENTORY_FINANCING,
					start_date=start_date,
					end_date=end_date,
					product_config=_get_default_contract_config({
						'interest_rate': 0.001
						
					})
				)
			return contract_fields

		company_id = seed.get_company_id('company_admin')
		user_id = seed.get_user_id('bank_admin')

		# First one success, no other contracts exist yet
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='01/01/2020',
				end_date='06/01/2020'
			)
		)

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		terminate_req = manage_contract_util.UpdateContractReqDict(
			contract_id=new_contract_id,
			contract_fields={
				'product_type': ProductType.INVENTORY_FINANCING,
				'start_date': '01/03/2020',
				'end_date': '05/01/2020',
				'product_config': _get_default_contract_config({
					'interest_rate': 0.001		
				})
			}
		)

		with session_scope(self.session_maker) as session:
			success, err = manage_contract_util.update_contract(
				terminate_req, bank_admin_user_id=user_id, session=session)
			self.assertTrue(success, msg=err)
			self.assertIsNone(err)

	def test_successful_update_on_dynamic_interest_rates(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		def _get_contract_fields(start_date: str, end_date: str) -> manage_contract_util.ContractFieldsDict:
			contract_fields = manage_contract_util.ContractFieldsDict(
					product_type=ProductType.INVENTORY_FINANCING,
					start_date=start_date,
					end_date=end_date,
					product_config=_get_default_contract_config({
						'dynamic_interest_rate': json.dumps({
							'01/01/2020-03/01/2020': 0.002,
							'03/02/2020-06/01/2020': 0.001
						})
					})
				)
			return contract_fields

		company_id = seed.get_company_id('company_admin')
		user_id = seed.get_user_id('bank_admin')

		# First one success, no other contracts exist yet
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='01/01/2020',
				end_date='06/01/2020'
			)
		)

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		terminate_req = manage_contract_util.UpdateContractReqDict(
			contract_id=new_contract_id,
			contract_fields={
				'product_type': ProductType.INVENTORY_FINANCING,
				'start_date': '01/03/2020',
				'end_date': '05/01/2020',
				'product_config': _get_default_contract_config({
					'interest_rate': 0.001		
				})
			}
		)

		with session_scope(self.session_maker) as session:
			success, err = manage_contract_util.update_contract(
				terminate_req, bank_admin_user_id=user_id, session=session)
			self.assertTrue(success, msg=err)
			self.assertIsNone(err)

class TestDeleteContract(db_unittest.TestCase):

	def test_successful_delete_simple_interest_only(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		def _get_contract_fields(start_date: str, end_date: str) -> manage_contract_util.ContractFieldsDict:
			contract_fields = manage_contract_util.ContractFieldsDict(
					product_type=ProductType.INVENTORY_FINANCING,
					start_date=start_date,
					end_date=end_date,
					product_config=_get_default_contract_config({
						'interest_rate': 0.001
						
					})
				)
			return contract_fields

		company_id = seed.get_company_id('company_admin')
		user_id = seed.get_user_id('bank_admin')

		# First one success, no other contracts exist yet
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='01/01/2020',
				end_date='06/01/2020'
			)
		)

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		terminate_req = manage_contract_util.TerminateContractReqDict(
			contract_id=new_contract_id,
			termination_date='05/01/2020'
		)
		success, err = manage_contract_util.terminate_contract(
			terminate_req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertTrue(success, msg=err)
		self.assertIsNone(err)

	def test_successful_delete_on_dynamic_interest_rates(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		def _get_contract_fields(start_date: str, end_date: str) -> manage_contract_util.ContractFieldsDict:
			contract_fields = manage_contract_util.ContractFieldsDict(
					product_type=ProductType.INVENTORY_FINANCING,
					start_date=start_date,
					end_date=end_date,
					product_config=_get_default_contract_config({
						'dynamic_interest_rate': json.dumps({
							'01/01/2020-03/01/2020': 0.002,
							'03/02/2020-06/01/2020': 0.001
						})
					})
				)
			return contract_fields

		company_id = seed.get_company_id('company_admin')
		user_id = seed.get_user_id('bank_admin')

		# First one success, no other contracts exist yet
		req = manage_contract_util.AddNewContractReqDict(
			company_id=company_id,
			contract_fields=_get_contract_fields(
				start_date='01/01/2020',
				end_date='06/01/2020'
			)
		)

		new_contract_id, err = manage_contract_util.add_new_contract(
			req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertIsNotNone(new_contract_id, msg=err)
		self.assertIsNone(err)

		terminate_req = manage_contract_util.TerminateContractReqDict(
			contract_id=new_contract_id,
			termination_date='05/01/2020'
		)
		success, err = manage_contract_util.terminate_contract(
			terminate_req, bank_admin_user_id=user_id, session_maker=session_maker)
		self.assertTrue(success, msg=err)
		self.assertIsNone(err)
