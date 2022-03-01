from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.companies import create_user_util
from bespoke.companies.create_user_util import CreateBankOrCustomerUserInputDict, UserInsertInputDict
from bespoke_test.db import db_unittest, test_helper

class TestCreateUser(db_unittest.TestCase):

	def test_create_user(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		parent_company_id = seed.get_parent_company_id('company_admin', index=0)
		company_id = seed.get_company_id('company_admin', index=0)

		USER_EMAIL = 'warren@cannabisbusiness.com'

		_, err = create_user_util.create_bank_or_customer_user(
			req=CreateBankOrCustomerUserInputDict(
				company_id=company_id,
				user=UserInsertInputDict(
					role=db_constants.UserRoles.COMPANY_ADMIN,
					first_name='Warren',
					last_name='Shen',
					email=USER_EMAIL,
					phone_number='4085293475',
				),
			),
			session_maker=session_maker
		)
		self.assertIsNone(err)

		expected_users = [
			{
				'parent_company_id': parent_company_id,
				'company_id': company_id,
				'email': USER_EMAIL,
			},
		]

		with session_scope(session_maker) as session:
			for index, expected_user in enumerate(expected_users):
				user = session.query(models.User).filter(
					models.User.email == expected_user['email']
				).first()

				exp = expected_user
				actual = user
				self.assertEqual(exp['email'], str(actual.email))
				self.assertEqual(exp['parent_company_id'], str(actual.parent_company_id))
				self.assertEqual(exp['company_id'], str(actual.company_id))
