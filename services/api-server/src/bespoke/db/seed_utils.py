"""
	A file that contains some helpers needed to construct certain types or perform some
	common operations on seed.py
"""
from typing import Any, Dict, cast

from sqlalchemy.orm.session import Session
from bespoke.db import models
from bespoke.db.db_constants import UserRoles, CompanyType, TwoFactorMessageMethod, LoginMethod
from bespoke.date import date_util

def create_partnership_req(
    requesting_company_id: int,
    requested_by_user_id: int,
	session: Session
) -> None:
    partnership_req = models.CompanyPartnershipRequest()
    partnership_req.requesting_company_id = requesting_company_id
    partnership_req.two_factor_message_method = TwoFactorMessageMethod.PHONE
    partnership_req.company_type = CompanyType.Vendor
    partnership_req.company_name = 'Vendor Company'
    partnership_req.is_cannabis = True
    partnership_req.requested_by_user_id = requested_by_user_id
    partnership_req.license_info = cast(Dict, {'license_ids': ['12121212']})
    partnership_req.settled_at = date_util.now()
    partnership_req.settled_by_user_id = requested_by_user_id

    partnership_req.user_info = {
        'first_name': 'Vendor',
        'last_name': '3',
        'email': 'vendor.3@customer.com',
        'phone_number': '+91 88888-88888'
    }
    
    session.add(partnership_req)
    session.flush()

def create_company_settings_and_company(
	session: Session
) -> models.Company:
    parent_company = models.ParentCompany(
        name="Parent of Vendor Company"
    )

    session.add(parent_company)
    session.flush()

    company_settings = models.CompanySettings()
    company_settings.two_factor_message_method = TwoFactorMessageMethod.PHONE

    session.add(company_settings)
    session.flush()

    company = models.Company(
        parent_company_id=str(parent_company.id),
        company_settings_id=company_settings.id,
        is_customer=False,
        is_payor=False,
        is_vendor=True,
        name='Vendor Company',
        is_cannabis=True,
    )

    session.add(company)
    session.flush()

    return company

def create_user_inside_a_company(
    parent_company_id: str,
    company_id: str,
	session: Session,
) -> None:
    user = models.User()
    user.parent_company_id = parent_company_id
    user.company_id = company_id
    user.first_name = 'Vendor'
    user.last_name = '3'
    user.email = 'vendor.3@customer.com'
    user.phone_number = '+91 88888-88888'
    user.role = UserRoles.COMPANY_CONTACT_ONLY
    user.login_method = LoginMethod.SIMPLE

    session.add(user)
    session.flush()

def create_company_license(
    company_id: int,
	session: Session
) -> None:
    new_license = models.CompanyLicense()
    new_license.company_id = cast(Any, company_id)
    new_license.license_number = '12121212'

    session.add(new_license)
    session.flush()

def create_company_vendor_partnership(
    company_id: str,
    vendor_id: str,
	session: Session
) -> None:
    bank_account = models.BankAccount( # type: ignore
        company_id=vendor_id,
        bank_name="Bank 1",
        account_type="type1",
        account_number="11",
        routing_number="11",
        can_ach=True,
        can_wire=True,
        recipient_address="123 Street",
        bank_address="123 street",
        account_title="Account 1",
        verified_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE),
        is_cannabis_compliant=True,
        verified_at=date_util.now(),
    )
    session.add(bank_account)
    session.flush()

    company_vendor_partnership = models.CompanyVendorPartnership(
        company_id=company_id,
        vendor_id=vendor_id,
        vendor_bank_id=bank_account.id,
        approved_at = date_util.now()
    )
    session.add(company_vendor_partnership)
    session.flush()
