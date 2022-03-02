from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.companies import create_user_util, partnership_util
from bespoke.companies.create_user_util import CreateBankOrCustomerUserInputDict, UserInsertInputDict
from bespoke_test.db import db_unittest, test_helper

class TestGetPartnerContacts(db_unittest.TestCase):

	def test_get_payor_partner_contacts(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		parent_customer_id = seed.get_parent_company_id('company_admin', index=0)
		customer_id = seed.get_company_id('company_admin', index=0)

		parent_payor_id = seed.get_parent_company_id('company_admin', index=1)
		payor_id = seed.get_company_id('company_admin', index=1)

		company_payor_partnership_id = None

		with session_scope(self.session_maker) as session:
			payor = session.query(models.Company).get(payor_id)
			payor.is_payor = True

		_, err = create_user_util.create_bank_or_customer_user(
			req=CreateBankOrCustomerUserInputDict(
				company_id=payor_id,
				user=UserInsertInputDict(
					role=db_constants.UserRoles.COMPANY_CONTACT_ONLY,
					first_name='Warren',
					last_name='Shen',
					email='warren@payor.com',
					phone_number='4085293475',
				),
			),
			session_maker=session_maker
		)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			company_payor_partnership = models.CompanyPayorPartnership(
				company_id=customer_id,
				payor_id=payor_id,
			)
			session.add(company_payor_partnership)
			session.flush()

			company_payor_partnership_id = company_payor_partnership.id

		with session_scope(self.session_maker) as session:
			partner_contacts, err = partnership_util.get_partner_contacts(
				partnership_id=company_payor_partnership_id,
				partnership_type=db_constants.CompanyType.Payor,
				session=session,
			)
			self.assertIsNone(err)
			self.assertTrue(len(partner_contacts) > 0)

			for partner_contact in partner_contacts:
				self.assertTrue(partner_contact['parent_company_id'] == parent_payor_id)

	def test_get_vendor_partner_contacts(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		parent_customer_id = seed.get_parent_company_id('company_admin', index=0)
		customer_id = seed.get_company_id('company_admin', index=0)

		parent_vendor_id = seed.get_parent_company_id('company_admin', index=1)
		vendor_id = seed.get_company_id('company_admin', index=1)

		company_vendor_partnership_id = None

		with session_scope(self.session_maker) as session:
			vendor = session.query(models.Company).get(vendor_id)
			vendor.is_vendor = True

		_, err = create_user_util.create_bank_or_customer_user(
			req=CreateBankOrCustomerUserInputDict(
				company_id=vendor_id,
				user=UserInsertInputDict(
					role=db_constants.UserRoles.COMPANY_CONTACT_ONLY,
					first_name='Warren',
					last_name='Shen',
					email='warren@vendor.com',
					phone_number='4085293475',
				),
			),
			session_maker=session_maker
		)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			company_vendor_partnership = models.CompanyVendorPartnership(
				company_id=customer_id,
				vendor_id=vendor_id,
			)
			session.add(company_vendor_partnership)
			session.flush()

			company_vendor_partnership_id = company_vendor_partnership.id

		with session_scope(self.session_maker) as session:
			partner_contacts, err = partnership_util.get_partner_contacts(
				partnership_id=company_vendor_partnership_id,
				partnership_type=db_constants.CompanyType.Vendor,
				session=session,
			)
			self.assertIsNone(err)
			self.assertTrue(len(partner_contacts) > 0)

			for partner_contact in partner_contacts:
				self.assertTrue(partner_contact['parent_company_id'] == parent_vendor_id)
