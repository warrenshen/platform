"""
	A file that contains some helpers needed to construct certain types or perform some
	common operations on seed.py
"""
import datetime
from decimal import Decimal
from typing import Any, cast, Dict, List, Optional, Tuple
import uuid

from bespoke import errors 
from sqlalchemy.orm.session import Session
from bespoke.db import models, queries
from bespoke.db.models import PurchaseOrderHistoryDict
from bespoke.db.db_constants import UserRoles, CompanySurveillanceStatus, \
    CompanyType, TwoFactorMessageMethod, LoginMethod, ProductType, TwoFactorMessageMethod, BankAccountType
from bespoke.date import date_util
from bespoke.finance import contract_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from server.views.common import auth_util

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

def create_bank_account(
    session: Session,
    account_number: str,
    account_title: str,
    account_type: str,
    ach_default_memo: str,
    bank_address: str,
    bank_instructions_file_id: str,
    bank_name: str,
    can_ach: bool,
    can_wire: bool,
    company_id: str,
    created_at: datetime.datetime,
    id: str,
    intermediary_account_name: str,
    intermediary_account_number: str,
    intermediary_bank_address: str,
    intermediary_bank_name: str,
    is_cannabis_compliant: bool,
    is_deleted: bool,
    is_wire_intermediary: bool,
    recipient_address: str,
    recipient_address_2: str,
    recipient_name: str,
    routing_number: str,
    torrey_pines_template_name: str,
    updated_at: datetime.datetime,
    us_state: str,
    verified_at: datetime.datetime,
    verified_date: datetime.date,
    wire_default_memo: str,
    wire_routing_number: str,
    wire_template_name: str,
) -> Tuple[models.BankAccount, errors.Error]:
    bank_account = models.BankAccount( # type: ignore
        account_number = account_number,
        account_title = account_title,
        account_type = account_type,
        ach_default_memo = ach_default_memo,
        bank_address = bank_address,
        bank_instructions_file_id = bank_instructions_file_id,
        bank_name = bank_name,
        can_ach = can_ach,
        can_wire = can_wire,
        company_id = company_id,
        id = id,
        intermediary_account_name = intermediary_account_name,
        intermediary_account_number = intermediary_account_number,
        intermediary_bank_address = intermediary_bank_address,
        intermediary_bank_name = intermediary_bank_name,
        is_cannabis_compliant = is_cannabis_compliant,
        is_deleted = is_deleted,
        is_wire_intermediary = is_wire_intermediary,
        recipient_address = recipient_address,
        recipient_address_2 = recipient_address_2,
        recipient_name = recipient_name,
        routing_number = routing_number,
        torrey_pines_template_name = torrey_pines_template_name,
        us_state = us_state,
        verified_at = verified_at,
        verified_date = verified_date,
        wire_default_memo = wire_default_memo,
        wire_routing_number = wire_routing_number,
        wire_template_name = wire_template_name,
    )

    session.add(bank_account)
    session.flush()

    return bank_account, None

def create_company(
    session: Session,
    address: str,
    city: str,
    company_settings_id: str,
    contract_id: str,
    contract_name: str,
    country: str,
    dba_name: str,
    debt_facility_status: Optional[str],
    debt_facility_waiver_date: datetime.date,
    debt_facility_waiver_expiration_date: datetime.date,
    id: str,
    identifier: str,
    is_cannabis: bool,
    is_customer: bool,
    is_payor: bool,
    is_vendor: bool,
    latest_disbursement_identifier: int,
    latest_loan_identifier: int,
    latest_repayment_identifier: int,
    name: str,
    parent_company_id: str,
    phone_number: str,
    qualify_for: Optional[str],
    state: str,
    surveillance_status: Optional[str],
    surveillance_status_note: str,
    zip_code: str,
) -> Tuple[models.Company, models.CompanySettings, models.ParentCompany, errors.Error]:
    company_id = str(uuid.uuid4()) if id is None else id
    company_settings_id = str(uuid.uuid4()) if company_settings_id is None else company_settings_id
    parent_company_id = str(uuid.uuid4()) if parent_company_id is None else parent_company_id

    parent_company, _ = queries.get_parent_company_by_id(
        session,
        parent_company_id,
    )

    if parent_company is None:
        parent_company = models.ParentCompany(
            id = parent_company_id,
            name = 'Cypress Parent Company',
        )
        session.add(parent_company)
        session.flush()

    company = models.Company(
        id = company_id,
        parent_company_id = parent_company_id, 
        address = address,
        city = city,
        contract_id = contract_id,
        contract_name = contract_name,
        country = country,
        dba_name = dba_name,
        debt_facility_status = debt_facility_status,
        debt_facility_waiver_date = debt_facility_waiver_date,
        debt_facility_waiver_expiration_date = debt_facility_waiver_expiration_date,
        identifier = identifier,
        is_cannabis = is_cannabis,
        is_customer = is_customer,
        is_payor = is_payor,
        is_vendor = is_vendor,
        latest_disbursement_identifier = latest_disbursement_identifier,
        latest_loan_identifier = latest_loan_identifier,
        latest_repayment_identifier = latest_repayment_identifier,
        name = name,
        phone_number = phone_number,
        qualify_for = qualify_for,
        state = state,
        surveillance_status = surveillance_status,
        surveillance_status_note = surveillance_status_note,
        zip_code = zip_code,
    )
    session.add(company)
    session.flush()

    company_settings = models.CompanySettings(
        id = company_settings_id,
        company_id = company_id,
    )
    session.add(company_settings)
    session.flush()

    company.company_settings_id = company_settings_id

    return company, company_settings, parent_company, None

def create_company_license_new(
    session: Session,
    company_id: str,
    created_at: datetime.datetime,
    estimate_latitude: float,
    estimate_longitude: float,
    estimate_zip: str,
    expiration_date: datetime.date,
    facility_row_id: str,
    file_id: str,
    id: str,
    is_current: bool,
    is_deleted: bool,
    is_underwriting_enabled: bool,
    legal_name: str,
    license_category: str,
    license_description: str,
    license_number: str,
    license_status: str,
    rollup_id: str,
    updated_at: datetime.datetime,
    us_state: str,
) -> Tuple[models.CompanyLicense, errors.Error]:

    company_license = models.CompanyLicense( # type: ignore
        company_id = company_id,
        created_at = created_at,
        estimate_latitude = Decimal(estimate_latitude) if estimate_latitude is not None else None,
        estimate_longitude = Decimal(estimate_longitude) if estimate_longitude is not None else None,
        estimate_zip = estimate_zip,
        expiration_date = expiration_date,
        facility_row_id = facility_row_id,
        file_id = file_id,
        id = id,
        is_current = is_current,
        is_deleted = is_deleted,
        is_underwriting_enabled = is_underwriting_enabled,
        legal_name = legal_name,
        license_category = license_category,
        license_description = license_description,
        license_number = license_number,
        license_status = license_status,
        rollup_id = rollup_id,
        updated_at = updated_at,
        us_state = us_state,
    )

    session.add(company_license)
    session.flush()

    return company_license, None

def add_company_partnership_request(
    session: Session,
    company_name: str,
    company_type: str,
    id: str,
    is_cannabis: bool,
    is_deleted: bool,
    license_info: Dict,
    request_info: Dict,
    requested_by_user_id: str,
    requesting_company_id: str,
    settled_at: datetime.datetime,
    settled_by_user_id: str,
    two_factor_message_method: str,
    user_info: Dict,
) -> Tuple[ models.CompanyPartnershipRequest, errors.Error ]:
    company_partnership_request = models.CompanyPartnershipRequest(
        company_name = company_name,
        company_type = company_type,
        is_cannabis = is_cannabis,
        is_deleted = is_deleted,
        license_info = license_info,
        request_info = request_info,
        requested_by_user_id = requested_by_user_id,
        requesting_company_id = requesting_company_id,
        settled_at = settled_at,
        settled_by_user_id = settled_by_user_id,
        two_factor_message_method = two_factor_message_method,
        user_info = user_info,
    )

    session.add(company_partnership_request)
    session.flush()

    return company_partnership_request, None

def update_company_settings(
    session: Session,
    id: str,
    company_id: str,
    active_ebba_application_id: str,
    active_borrowing_base_id: str,
    active_financial_report_id: str,
    metrc_api_key_id: str,
    advances_bespoke_bank_account_id: str,
    collections_bespoke_bank_account_id: str,
    advances_bank_account_id: str,
    collections_bank_account_id: str,
    vendor_agreement_docusign_template: str,
    payor_agreement_docusign_template: str,
    vendor_onboarding_link: str,
    has_autofinancing: bool,
    two_factor_message_method: Optional[str],
    feature_flags_payload: Dict,
    custom_messages_payload: Dict,
    is_dummy_account: bool,
    client_success_user_id: str,
    business_development_user_id: str,
    underwriter_user_id: str,
    is_autogenerate_repayments_enabled: bool,
) -> Tuple[models.CompanySettings, errors.Error]:
    """
        This break from the create_something pattern as we have to create
        the company settings when we create the company since they are so
        tightly coupled. However, we want to have a separate endpoint for
        populating all the details
    """
    company_settings, err = queries.get_company_settings_by_id(
        session,
        id,
    )
    if err:
        return None, err

    company_settings.active_ebba_application_id = active_ebba_application_id # type: ignore
    company_settings.active_borrowing_base_id = active_borrowing_base_id # type: ignore
    company_settings.active_financial_report_id = active_financial_report_id # type: ignore
    company_settings.metrc_api_key_id = metrc_api_key_id # type: ignore
    company_settings.advances_bespoke_bank_account_id = advances_bespoke_bank_account_id # type: ignore
    company_settings.collections_bespoke_bank_account_id = collections_bespoke_bank_account_id # type: ignore
    company_settings.advances_bank_account_id = advances_bank_account_id # type: ignore
    company_settings.collections_bank_account_id = collections_bank_account_id # type: ignore
    company_settings.vendor_agreement_docusign_template = vendor_agreement_docusign_template
    company_settings.payor_agreement_docusign_template = payor_agreement_docusign_template
    company_settings.vendor_onboarding_link = vendor_onboarding_link
    company_settings.has_autofinancing = has_autofinancing
    company_settings.two_factor_message_method = two_factor_message_method
    company_settings.feature_flags_payload = feature_flags_payload
    company_settings.custom_messages_payload = custom_messages_payload
    company_settings.is_dummy_account = is_dummy_account
    company_settings.client_success_user_id = client_success_user_id # type: ignore
    company_settings.business_development_user_id = business_development_user_id # type: ignore
    company_settings.underwriter_user_id = underwriter_user_id # type: ignore
    company_settings.is_autogenerate_repayments_enabled = is_autogenerate_repayments_enabled

    session.flush()

    return company_settings, None

def create_company_vendor_partnership_new(
    session: Session,
    approved_at: datetime.datetime,
    company_id: str,
    created_at: datetime.datetime,
    id: str,
    updated_at: datetime.datetime,
    vendor_agreement_id: str, # type: ignore
    vendor_bank_id: str,
    vendor_id: str,
) -> Tuple[models.CompanyVendorPartnership, errors.Error]:

    company_vendor_partnership = models.CompanyVendorPartnership( # type: ignore
        approved_at = approved_at,
        company_id = company_id,
        created_at = created_at,
        id = id,
        updated_at = updated_at,
        vendor_agreement_id = vendor_agreement_id,
        vendor_bank_id = vendor_bank_id,
        vendor_id = vendor_id,
    )

    session.add(company_vendor_partnership)
    session.flush()

    return company_vendor_partnership, None

def create_contract(
    session: Session,
    id: str,
    company_id: str,
    product_type: str,
    start_date: str,
    end_date: str,
    adjusted_end_date: str,
    modified_by_user_id: str, 
    terminated_at: datetime.datetime,
    terminated_by_user_id: str,
    is_deleted: bool,
    contract_financing_terms: int,
    interest_rate: float,
    advance_rate: float,
    maximum_principal_amount: float,
    max_days_until_repayment: int,
    late_fee_structure: str,
    dynamic_interest_rate: str,
    preceeding_business_day: bool,
    minimum_monthly_amount: float,
    minimum_quarterly_amount: float,
    minimum_annual_amount: float,
    factoring_fee_threshold: float,
    factoring_fee_threshold_starting_value: float,
    adjusted_factoring_fee_percentage: float,
    wire_fee: float,
    repayment_type_settlement_timeline: str,
    timezone: str,
    us_state: str,
    borrowing_base_accounts_receivable_percentage: float,
    borrowing_base_inventory_percentage: float,
    borrowing_base_cash_percentage: float,
    borrowing_base_cash_in_daca_percentage: float,
) -> Tuple[models.Contract, errors.Error]:
    contract = models.Contract( # type: ignore
        company_id = company_id,
        product_type = product_type,
        product_config = contract_test_helper.create_contract_config(
            product_type = product_type,
            input_dict = ContractInputDict(
                contract_financing_terms = contract_financing_terms,
                interest_rate = interest_rate,
                advance_rate = advance_rate,
                maximum_principal_amount = maximum_principal_amount,
                max_days_until_repayment = max_days_until_repayment,
                late_fee_structure = late_fee_structure,
                dynamic_interest_rate = dynamic_interest_rate,
                preceeding_business_day = preceeding_business_day,
                minimum_monthly_amount = minimum_monthly_amount,
                minimum_quarterly_amount = minimum_quarterly_amount,
                minimum_annual_amount = minimum_annual_amount,
                factoring_fee_threshold = factoring_fee_threshold,
                factoring_fee_threshold_starting_value = factoring_fee_threshold_starting_value,
                adjusted_factoring_fee_percentage = adjusted_factoring_fee_percentage,
                wire_fee = wire_fee,
                repayment_type_settlement_timeline = repayment_type_settlement_timeline,
                timezone = timezone,
                us_state = us_state,
                borrowing_base_accounts_receivable_percentage = borrowing_base_accounts_receivable_percentage,
                borrowing_base_inventory_percentage = borrowing_base_inventory_percentage,
                borrowing_base_cash_percentage = borrowing_base_cash_percentage,
                borrowing_base_cash_in_daca_percentage = borrowing_base_cash_in_daca_percentage,
            )
        ),    
        start_date = date_util.load_date_str(start_date),
        end_date = date_util.load_date_str(end_date),
        adjusted_end_date = date_util.load_date_str(adjusted_end_date),
        modified_by_user_id = modified_by_user_id, 
        terminated_at = terminated_at,
        terminated_by_user_id = terminated_by_user_id,
        is_deleted = is_deleted,
    )
    if id is not None:
        contract.id = id
    
    session.add(contract)
    session.flush()

    customer, err = queries.get_company_by_id(
        session,
        company_id
    )
    if err:
        return None, err

    customer.contract_id = contract.id
    session.flush()

    return contract, None

def create_ebba_application(
    session: Session,
    id: str,
    company_id: str,
    category: str,
    status: str,
    application_date: datetime.date,
    is_deleted: bool,
    submitted_by_user_id: str,
    approved_by_user_id: str,
    rejected_by_user_id: str,
    monthly_accounts_receivable: float,
    monthly_inventory: float,
    monthly_cash: float,
    amount_cash_in_daca: float,
    amount_custom: float,
    amount_custom_note: str,
    bank_note: str,
    calculated_borrowing_base: str,
    rejection_note: str,
    expires_date: datetime.date,
    requested_at: datetime.datetime,
    approved_at: datetime.datetime,
    rejected_at: datetime.datetime,
) -> Tuple[models.EbbaApplication, errors.Error]:
    ebba_application = models.EbbaApplication( # type: ignore
        id = id,
        company_id = company_id,
        category = category,
        status = status,
        application_date = application_date,
        is_deleted = is_deleted,
        submitted_by_user_id = submitted_by_user_id,
        approved_by_user_id = approved_by_user_id,
        rejected_by_user_id = rejected_by_user_id,
        monthly_accounts_receivable = Decimal(monthly_accounts_receivable),
        monthly_inventory = Decimal(monthly_inventory),
        monthly_cash = Decimal(monthly_cash),
        amount_cash_in_daca = Decimal(amount_cash_in_daca),
        amount_custom = Decimal(amount_custom),
        amount_custom_note = amount_custom_note,
        bank_note = bank_note,
        calculated_borrowing_base = calculated_borrowing_base,
        rejection_note = rejection_note,
        expires_date = expires_date,
        requested_at = requested_at,
        approved_at = approved_at,
        rejected_at = rejected_at,
    )

    session.add(ebba_application)
    session.flush()

    return ebba_application, None

def create_file(
    session: Session,
    id: str,
    company_id: str,
    created_at: datetime.datetime,
    created_by_user_id: str,
    extension: str,
    mime_type: str,
    name: str,
    path: str,
    sequential_id: str,
    size: int,
    updated_at: datetime.datetime,
) -> Tuple[models.File, errors.Error]:
    file = models.File( # type:ignore
        company_id = company_id,
        created_by_user_id = created_by_user_id,
        extension = extension,
        mime_type = mime_type,
        name = name,
        path = path,
        sequential_id = sequential_id,
        size = size,
    )
    if id is not None:
        file.id = id

    session.add(file)
    session.flush()

    return file, None

def create_financial_summary(
    session: Session,
    id: str,
    company_id: str,
    total_limit: float,
    total_outstanding_principal: float,
    total_outstanding_interest: float,
    total_principal_in_requested_state: float,
    available_limit: float,
    total_outstanding_fees: float,
    adjusted_total_limit: float,
    date: Optional[datetime.date],
    total_outstanding_principal_for_interest: float,
    minimum_monthly_payload: Dict,
    account_level_balance_payload: Dict,
    day_volume_threshold_met: Optional[datetime.date],
    interest_accrued_today: float,
    total_amount_to_pay_interest_on: float,
    product_type: Optional[str],
    needs_recompute: bool,
    days_to_compute_back: int,
    total_interest_paid_adjustment_today: float,
    total_fees_paid_adjustment_today: float,
    total_outstanding_principal_past_due: float,
    daily_interest_rate: float,
    minimum_interest_duration: str,
    minimum_interest_amount: float,
    minimum_interest_remaining: float,
    most_overdue_loan_days: int,
    late_fees_accrued_today: float,
    loans_info: Dict,
) -> Tuple[models.FinancialSummary, errors.Error]:
    financial_summary = models.FinancialSummary(
        company_id = company_id,
        total_limit = Decimal(total_limit),
        total_outstanding_principal = Decimal(total_outstanding_principal),
        total_outstanding_interest = Decimal(total_outstanding_interest),
        total_principal_in_requested_state = Decimal(total_principal_in_requested_state),
        available_limit = Decimal(available_limit),
        total_outstanding_fees = Decimal(total_outstanding_fees),
        adjusted_total_limit = Decimal(adjusted_total_limit),
        date = date,
        total_outstanding_principal_for_interest = Decimal(total_outstanding_principal_for_interest),
        minimum_monthly_payload = minimum_monthly_payload,
        account_level_balance_payload = account_level_balance_payload,
        day_volume_threshold_met = day_volume_threshold_met,
        interest_accrued_today = Decimal(interest_accrued_today),
        total_amount_to_pay_interest_on = Decimal(total_amount_to_pay_interest_on),
        product_type = product_type,
        needs_recompute = needs_recompute,
        days_to_compute_back = days_to_compute_back,
        total_interest_paid_adjustment_today = Decimal(total_interest_paid_adjustment_today),
        total_fees_paid_adjustment_today = Decimal(total_fees_paid_adjustment_today),
        total_outstanding_principal_past_due = Decimal(total_outstanding_principal_past_due),
        daily_interest_rate = Decimal(daily_interest_rate),
        minimum_interest_duration = minimum_interest_duration,
        minimum_interest_amount = Decimal(minimum_interest_amount),
        minimum_interest_remaining = Decimal(minimum_interest_remaining),
        most_overdue_loan_days = most_overdue_loan_days,
        late_fees_accrued_today = Decimal(late_fees_accrued_today),
        loans_info = loans_info,
    )
    if id is not None:
        financial_summary.id = id

    session.add(financial_summary)
    session.flush()

    return financial_summary, None

def create_loan(
    session: Session,
    id: str,
    company_id: str,
    loan_report_id: str,
    created_at: datetime.datetime,
    updated_at: datetime.datetime,
    identifier: str,
    disbursement_identifier: str,
    loan_type: str,
    artifact_id: str,
    requested_payment_date: datetime.date,
    origination_date: datetime.date,
    maturity_date: datetime.date,
    adjusted_maturity_date: datetime.date,
    amount: float,
    status: str,
    payment_status: str,
    notes: str,
    customer_notes: str,
    requested_at: datetime.datetime,
    requested_by_user_id: str,
    closed_at: datetime.datetime,
    rejected_at: datetime.datetime,
    rejected_by_user_id: str,
    rejection_note: str,
    approved_at: datetime.datetime,
    approved_by_user_id: str,
    funded_at: str,
    funded_by_user_id: str,
    outstanding_principal_balance: float,
    outstanding_interest: float,
    outstanding_fees: float,
    is_deleted: bool,
    is_frozen: bool
) -> Tuple[models.Loan, errors.Error]:
    loan = models.Loan( # type: ignore
        id = id,
        company_id = company_id,
        loan_report_id = loan_report_id,
        created_at = created_at,
        updated_at = updated_at,
        identifier = identifier,
        disbursement_identifier = disbursement_identifier,
        loan_type = loan_type,
        artifact_id = artifact_id,
        requested_payment_date = requested_payment_date,
        origination_date = origination_date,
        maturity_date = maturity_date,
        adjusted_maturity_date = adjusted_maturity_date,
        amount = Decimal(amount),
        status = status,
        payment_status = payment_status,
        notes = notes,
        customer_notes = customer_notes,
        requested_at = requested_at,
        requested_by_user_id = requested_by_user_id,
        closed_at = closed_at,
        rejected_at = rejected_at,
        rejected_by_user_id = rejected_by_user_id,
        rejection_note = rejection_note,
        approved_at = approved_at,
        approved_by_user_id = approved_by_user_id,
        funded_at = funded_at,
        funded_by_user_id = funded_by_user_id,
        outstanding_principal_balance = Decimal(outstanding_principal_balance),
        outstanding_interest = Decimal(outstanding_interest),
        outstanding_fees = Decimal(outstanding_fees),
        is_deleted = is_deleted,
        is_frozen = is_frozen
    )

    session.add(loan)
    session.flush()

    return loan, None

def create_purchase_order(
    session: Session,
    all_bank_notes: Dict,
    all_customer_notes: Dict,
    amount: float,
    amount_funded: float,
    amount_updated_at: datetime.datetime,
    approved_at: datetime.datetime,
    approved_by_user_id: str,
    bank_incomplete_note: str,
    bank_note: str,
    bank_rejection_note: str,
    closed_at: datetime.datetime,
    company_id: str,
    customer_note: str,
    delivery_date: datetime.date,
    funded_at: datetime.datetime,
    history: List[PurchaseOrderHistoryDict],
    id: str,
    incompleted_at: datetime.datetime,
    is_cannabis: bool,
    is_deleted: bool,
    is_metrc_based: bool,
    net_terms: int,
    new_purchase_order_status: str,
    order_date: datetime.date,
    order_number: str,
    rejected_at: datetime.datetime,
    rejected_by_user_id: str,
    rejection_note: str,
    requested_at: datetime.datetime,
    status: str,
    vendor_id: str,
) -> Tuple[models.PurchaseOrder, errors.Error]:
    purchase_order = models.PurchaseOrder( # type: ignore
        all_bank_notes = all_bank_notes,
        all_customer_notes = all_customer_notes,
        amount = Decimal(amount),
        amount_funded = Decimal(amount_funded),
        #amount_updated_at = amount_updated_at,
        approved_at = approved_at,
        approved_by_user_id = approved_by_user_id,
        bank_incomplete_note = bank_incomplete_note,
        bank_note = bank_note,
        bank_rejection_note = bank_rejection_note,
        closed_at = closed_at,
        company_id = company_id,
        customer_note = customer_note,
        delivery_date = delivery_date,
        funded_at = funded_at,
        # This is causing a sqlalchemy error where it cannot find
        # the column on the model. This is very odd because we're using
        # it just fine (from the model) in our regular flows. Since
        # we do not currently have any tests requiring this column, we
        # deferred finding root cause since a timeboxed effort did 
        # not find a solution
        #history = history,
        incompleted_at = incompleted_at,
        is_cannabis = is_cannabis,
        is_deleted = is_deleted,
        is_metrc_based = is_metrc_based,
        net_terms = net_terms,
        new_purchase_order_status = new_purchase_order_status,
        order_date = order_date,
        order_number = order_number,
        rejected_at = rejected_at,
        rejected_by_user_id = rejected_by_user_id,
        rejection_note = rejection_note,
        requested_at = requested_at,
        status = status,
        vendor_id = vendor_id,
    )
    if id is not None:
        purchase_order.id = id

    session.add(purchase_order)
    session.flush()

    return purchase_order, None

def create_purchase_order_file(
    session: Session,
    created_at: datetime.datetime,
    file_id: str,
    file_type: str,
    purchase_order_id: str,
    updated_at: datetime.datetime,
) -> Tuple[models.PurchaseOrderFile, errors.Error]:
    purchase_order_file = models.PurchaseOrderFile( # type:ignore
        file_id = file_id,
        file_type = file_type,
        purchase_order_id = purchase_order_id,
    )

    session.add(purchase_order_file)
    session.flush()

    return purchase_order_file, None

def create_two_factor_link(
    session: Session,
    id: str,
    expires_at: datetime.datetime,
    form_info: Dict,
    token_states: Dict,
) -> Tuple[models.TwoFactorLink, errors.Error]:
    two_factor_link = models.TwoFactorLink(
        expires_at = expires_at,
        form_info = form_info,
        token_states = token_states,
    )
    if id is not None:
        two_factor_link.id = id

    session.add(two_factor_link)
    session.flush()

    return two_factor_link, None

def create_user(
    session: Session,
    id: str,
    parent_company_id: str,
    company_id: str,
    email: str,
    password: str,
    role: str,
    company_role: str,
    company_role_new: Dict,
    first_name: str,
    last_name: str,
    phone_number: str,
    is_deleted: bool,
    login_method: str,
) -> Tuple[models.User, errors.Error]:
    user = models.User(
        parent_company_id = parent_company_id,
        company_id = company_id,
        email = email,
        #password = password,
        role = role,
        company_role = company_role,
        company_role_new = company_role_new,
        first_name = first_name,
        last_name = last_name,
        phone_number = phone_number,
        is_deleted = is_deleted,
        login_method = login_method,
    )
    if id is not None:
        user.id = id

    session.add(user)
    session.flush()

    auth_util.create_login_for_user(user, password)

    return user, None

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
