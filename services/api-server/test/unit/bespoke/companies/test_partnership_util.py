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

		payor_user_id, err = create_user_util.create_bank_or_customer_user(
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
			session_maker=session_maker,
			created_by_user_id=seed.get_user_id('company_admin', index=0),
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
			company_payor_contact = models.CompanyPayorContact(  # type: ignore
				partnership_id = company_payor_partnership_id,
				payor_user_id = payor_user_id,
			)
			session.add(company_payor_contact)
			session.flush()

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

		vendor_user_id, err = create_user_util.create_bank_or_customer_user(
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
			session_maker=session_maker,
			created_by_user_id=seed.get_user_id('company_admin', index=0),
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
			company_vendor_contact = models.CompanyVendorContact(  # type: ignore
				partnership_id = company_vendor_partnership_id,
				vendor_user_id = vendor_user_id,
				is_active = True,
			)
			session.add(company_vendor_contact)
			session.flush()

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

	def test_get_vendor_partner_contacts_active_contact_filters(self) -> None:
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

		vendor_user_id1, err = create_user_util.create_bank_or_customer_user(
			req=CreateBankOrCustomerUserInputDict(
				company_id=vendor_id,
				user=UserInsertInputDict(
					role=db_constants.UserRoles.COMPANY_CONTACT_ONLY,
					first_name='John',
					last_name='Doe',
					email='john@vendor.com',
					phone_number='4085293475',
				),
			),
			session_maker=session_maker,
			created_by_user_id=seed.get_user_id('company_admin', index=0),
		)
		self.assertIsNone(err)

		vendor_user_id2, err = create_user_util.create_bank_or_customer_user(
			req=CreateBankOrCustomerUserInputDict(
				company_id=vendor_id,
				user=UserInsertInputDict(
					role=db_constants.UserRoles.COMPANY_CONTACT_ONLY,
					first_name='Jane',
					last_name='Doe',
					email='jane@vendor.com',
					phone_number='2406019166',
				),
			),
			session_maker=session_maker,
			created_by_user_id=seed.get_user_id('company_admin', index=0),
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
			company_vendor_contact1 = models.CompanyVendorContact(  # type: ignore
				partnership_id = company_vendor_partnership_id,
				vendor_user_id = vendor_user_id1,
				is_active = True,
			)
			session.add(company_vendor_contact1)

			company_vendor_contact2 = models.CompanyVendorContact(  # type: ignore
				partnership_id = company_vendor_partnership_id,
				vendor_user_id = vendor_user_id2,
				is_active = False,
			)
			session.add(company_vendor_contact2)

			session.flush()

		with session_scope(self.session_maker) as session:
			partner_contacts, err = partnership_util.get_partner_contacts(
				partnership_id=company_vendor_partnership_id,
				partnership_type=db_constants.CompanyType.Vendor,
				session=session,
			)
			self.assertIsNone(err)
			self.assertEquals(len(partner_contacts), 1)

			for partner_contact in partner_contacts:
				self.assertTrue(partner_contact['parent_company_id'] == parent_vendor_id)

	def test_get_vendor_partner_contacts_with_no_active_contacts(self) -> None:
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

		vendor_user_id, err = create_user_util.create_bank_or_customer_user(
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
			session_maker=session_maker,
			created_by_user_id=seed.get_user_id('company_admin', index=0),
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
			# is_active is being set to false is very importand here
			# we *EXPECT* this to error out, so we have to set this flag as such
			company_vendor_contact = models.CompanyVendorContact(  # type: ignore
				partnership_id = company_vendor_partnership_id,
				vendor_user_id = vendor_user_id,
				is_active = False,
			)
			session.add(company_vendor_contact)
			session.flush()

		with session_scope(self.session_maker) as session:
			partner_contacts, err = partnership_util.get_partner_contacts(
				partnership_id=company_vendor_partnership_id,
				partnership_type=db_constants.CompanyType.Vendor,
				session=session,
			)
			self.assertIsNotNone(err)
			self.assertEquals(err.msg, 'Could not find contacts for this vendor partnership')
