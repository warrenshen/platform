// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import "cypress-file-upload";

import {
  BankAccounts,
  Companies,
  CompanyLicenses,
  CompanyPartnershipRequests,
  CompanySettings,
  CompanyVendorPartnerships,
  Contracts,
  FinancialSummaries,
  PurchaseOrders,
} from "@app/generated/graphql";
import { format } from "date-fns";

import { password, users } from "../fixtures/logins";

declare global {
  namespace Cypress {
    interface Chainable {
      loginBankAdmin: typeof loginBankAdmin;
      loginCustomerAdmin: typeof loginCustomerAdmin;
      logout: typeof logout;
      resetDatabase: typeof resetDatabase;
      todayAsDateStringClient: typeof todayAsDateStringClient;
    }
  }
}

Cypress.Commands.add("dataCy", (value) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("dataCySelector", (value, selector) => {
  return cy.get(`[data-cy=${value}] *> ${selector}`);
});

function resetDatabase() {
  cy.request("POST", `${Cypress.env("apiServerUrl")}/cypress/reset_database`);
}

export const DateFormatClient = "MM/dd/yyyy";

function todayAsDateStringClient(): string {
  return format(new Date(), DateFormatClient);
}

Cypress.Commands.add("resetDatabase", resetDatabase);
Cypress.Commands.add("todayAsDateStringClient", todayAsDateStringClient);

// ///////////////////////////////
// AUTHORIZATION
// ///////////////////////////////

function loginBankAdmin() {
  cy.visit("/", { timeout: 5 * 60 * 1000 });

  cy.dataCySelector("sign-in-input-email", "input").type(users.bank.admin);
  cy.dataCySelector("sign-in-input-password", "input").type(password);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

function loginCustomerAdmin() {
  cy.visit("/", { timeout: 5 * 60 * 1000 });

  cy.dataCySelector("sign-in-input-email", "input").type(
    users.customer.inventoryFinancing.admin
  );
  cy.dataCySelector("sign-in-input-password", "input").type(password);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

function loginCustomerAdminNew(userEmail: string, userPassword: string) {
  cy.visit("/", { timeout: 5 * 60 * 1000 });

  cy.dataCySelector("sign-in-input-email", "input").type(userEmail);
  cy.dataCySelector("sign-in-input-password", "input").type(userPassword);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

function logout() {
  cy.visit("/", { timeout: 5 * 60 * 1000 });

  cy.dataCy("user-profile-icon-button").click();
  cy.dataCy("user-logout-button").click();

  cy.url().should("include", "sign-in");
}

Cypress.Commands.add("loginBankAdmin", loginBankAdmin);
Cypress.Commands.add("loginCustomerAdmin", loginCustomerAdmin);
Cypress.Commands.add("loginCustomerAdminNew", loginCustomerAdminNew);
Cypress.Commands.add("logout", logout);

// ///////////////////////////////
// TEST DATA INSERTION
// ///////////////////////////////

function addBankAccount({
  account_number,
  account_title,
  account_type,
  ach_default_memo,
  bank_address,
  bank_instructions_file_id,
  bank_name,
  can_ach,
  can_wire,
  company_id,
  created_at,
  id,
  intermediary_account_name,
  intermediary_account_number,
  intermediary_bank_address,
  intermediary_bank_name,
  is_cannabis_compliant,
  is_deleted,
  is_wire_intermediary,
  recipient_address,
  recipient_address_2,
  recipient_name,
  routing_number,
  torrey_pines_template_name,
  updated_at,
  us_state,
  verified_at,
  verified_date,
  wire_default_memo,
  wire_routing_number,
  wire_template_name,
}: BankAccounts) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_bank_account`,
    {
      account_number: account_number || null,
      account_title: account_title || null,
      account_type: account_type || null,
      ach_default_memo: ach_default_memo || null,
      bank_address: bank_address || null,
      bank_instructions_file_id: bank_instructions_file_id || null,
      bank_name: bank_name || null,
      can_ach: can_ach || null,
      can_wire: can_wire || null,
      company_id: company_id || null,
      created_at: created_at,
      id: id || null,
      intermediary_account_name: intermediary_account_name || null,
      intermediary_account_number: intermediary_account_number || null,
      intermediary_bank_address: intermediary_bank_address || null,
      intermediary_bank_name: intermediary_bank_name || null,
      is_cannabis_compliant: is_cannabis_compliant || null,
      is_deleted: is_deleted || null,
      is_wire_intermediary: is_wire_intermediary || null,
      recipient_address: recipient_address || null,
      recipient_address_2: recipient_address_2 || null,
      recipient_name: recipient_name || null,
      routing_number: routing_number || null,
      torrey_pines_template_name: torrey_pines_template_name || null,
      updated_at: updated_at || null,
      us_state: us_state || null,
      verified_at: verified_at || null,
      verified_date: verified_date || null,
      wire_default_memo: wire_default_memo || null,
      wire_routing_number: wire_routing_number || null,
      wire_template_name: wire_template_name || null,
    }
  ).then((response) => {
    const bankAccountId = !!response?.body?.data?.bank_account_id
      ? response.body.data.bank_account_id
      : null;

    return cy.wrap(bankAccountId);
  });
}

function addCompany({
  address,
  city,
  company_settings_id,
  contract_id,
  contract_name,
  country,
  dba_name,
  debt_facility_status,
  debt_facility_waiver_date,
  debt_facility_waiver_expiration_date,
  id,
  identifier,
  is_cannabis,
  is_customer,
  is_payor,
  is_vendor,
  latest_disbursement_identifier,
  latest_loan_identifier,
  latest_repayment_identifier,
  name,
  parent_company_id,
  phone_number,
  qualify_for,
  state,
  surveillance_status,
  surveillance_status_note,
  zip_code,
}: Companies) {
  cy.request("POST", `${Cypress.env("apiServerUrl")}/cypress/add_company`, {
    address: address || null,
    city: city || null,
    company_settings_id: company_settings_id || null,
    contract_id: contract_id || null,
    contract_name: contract_name || null,
    country: country || null,
    dba_name: dba_name || null,
    debt_facility_status: debt_facility_status || null,
    debt_facility_waiver_date: debt_facility_waiver_date || null,
    debt_facility_waiver_expiration_date:
      debt_facility_waiver_expiration_date || null,
    id: id || null,
    identifier: identifier || null,
    is_cannabis: is_cannabis || null,
    is_customer: is_customer || null,
    is_payor: is_payor || null,
    is_vendor: is_vendor || null,
    latest_disbursement_identifier: latest_disbursement_identifier || null,
    latest_loan_identifier: latest_loan_identifier || null,
    latest_repayment_identifier: latest_repayment_identifier || null,
    name: name || null,
    parent_company_id: parent_company_id || null,
    phone_number: phone_number || null,
    qualify_for: qualify_for || null,
    state: state || null,
    surveillance_status: surveillance_status || null,
    surveillance_status_note: surveillance_status_note || null,
    zip_code: zip_code || null,
  }).then((response) => {
    const companyId = !!response?.body?.data?.company_id
      ? response.body.data.company_id
      : null;

    const companySettingsId = !!response?.body?.data?.company_settings_id
      ? response.body.data.company_settings_id
      : null;

    const parentCompanyId = !!response?.body?.data?.parent_company_id
      ? response.body.data.parent_company_id
      : null;

    return cy.wrap({
      companyId: companyId,
      companySettingsId: companySettingsId,
      parentCompanyId: parentCompanyId,
    });
  });
}

function addCompanyLicense({
  company_id,
  created_at,
  estimate_latitude,
  estimate_longitude,
  estimate_zip,
  expiration_date,
  facility_row_id,
  file_id,
  id,
  is_current,
  is_deleted,
  is_underwriting_enabled,
  legal_name,
  license_category,
  license_description,
  license_number,
  license_status,
  rollup_id,
  updated_at,
  us_state,
}: CompanyLicense) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_license`,
    {
      company_id: company_id || null,
      created_at: created_at || null,
      estimate_latitude: estimate_latitude || null,
      estimate_longitude: estimate_longitude || null,
      estimate_zip: estimate_zip || null,
      expiration_date: expiration_date || null,
      facility_row_id: facility_row_id || null,
      file_id: file_id || null,
      id: id || null,
      is_current: is_current || null,
      is_deleted: is_deleted || null,
      is_underwriting_enabled: is_underwriting_enabled || null,
      legal_name: legal_name || null,
      license_category: license_category || null,
      license_description: license_description || null,
      license_number: license_number || null,
      license_status: license_status || null,
      rollup_id: rollup_id || null,
      updated_at: updated_at || null,
      us_state: us_state || null,
    }
  ).then((response) => {
    const companyLicenseId = !!response?.body?.data?.company_license_id
      ? response.body.data.company_license_id
      : null;

    return cy.wrap(companyLicenseId);
  });
}

function addCompanyPartnershipRequest({
  company_name,
  company_type,
  created_at,
  id,
  is_cannabis,
  is_deleted,
  license_info,
  request_info,
  requested_by_user_id,
  requesting_company_id,
  settled_at,
  settled_by_user_id,
  two_factor_message_method,
  updated_at,
  user_info,
}: CompanyPartnershipRequests) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_partnership_request`,
    {
      company_name: company_name || null,
      company_type: company_type || null,
      created_at: created_at || null,
      id: id || null,
      is_cannabis: is_cannabis || null,
      is_deleted: is_deleted || null,
      license_info: license_info || null,
      request_info: request_info || null,
      requested_by_user_id: requested_by_user_id || null,
      requesting_company_id: requesting_company_id || null,
      settled_at: settled_at || null,
      settled_by_user_id: settled_by_user_id || null,
      two_factor_message_method: two_factor_message_method || null,
      updated_at: updated_at || null,
      user_info: user_info || null,
    }
  ).then((response) => {
    const companyPartnershipRequestId = !!response?.body?.data
      ?.company_partnership_request_id
      ? response.body.data.company_partnership_request_id
      : null;

    return cy.wrap(companyPartnershipRequestId);
  });
}

function updateCompanySettings({
  id,
  company_id,
  active_ebba_application_id,
  active_borrowing_base_id,
  active_financial_report_id,
  metrc_api_key_id,
  advances_bespoke_bank_account_id,
  collections_bespoke_bank_account_id,
  advances_bank_account_id,
  collections_bank_account_id,
  vendor_agreement_docusign_template,
  payor_agreement_docusign_template,
  vendor_onboarding_link,
  has_autofinancing,
  two_factor_message_method,
  feature_flags_payload,
  custom_messages_payload,
  is_dummy_account,
  client_success_user_id,
  business_development_user_id,
  underwriter_user_id,
  is_autogenerate_repayments_enabled,
}: CompanySettings) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_settings`,
    {
      id: id || null,
      company_id: company_id || null,
      active_ebba_application_id: active_ebba_application_id || null,
      active_borrowing_base_id: active_borrowing_base_id || null,
      active_financial_report_id: active_financial_report_id || null,
      metrc_api_key_id: metrc_api_key_id || null,
      advances_bespoke_bank_account_id:
        advances_bespoke_bank_account_id || null,
      collections_bespoke_bank_account_id:
        collections_bespoke_bank_account_id || null,
      advances_bank_account_id: advances_bank_account_id || null,
      collections_bank_account_id: collections_bank_account_id || null,
      vendor_agreement_docusign_template:
        vendor_agreement_docusign_template || null,
      payor_agreement_docusign_template:
        payor_agreement_docusign_template || null,
      vendor_onboarding_link: vendor_onboarding_link || null,
      has_autofinancing: has_autofinancing || null,
      two_factor_message_method: two_factor_message_method || null,
      feature_flags_payload: feature_flags_payload || null,
      custom_messages_payload: custom_messages_payload || null,
      is_dummy_account: is_dummy_account || null,
      client_success_user_id: client_success_user_id || null,
      business_development_user_id: business_development_user_id || null,
      underwriter_user_id: underwriter_user_id || null,
      is_autogenerate_repayments_enabled:
        is_autogenerate_repayments_enabled || null,
    }
  ).then((response) => {
    const companySettingsId = !!response?.body?.data?.company_settings_id
      ? response.body.data.company_settings_id
      : null;

    return cy.wrap(companySettingsId);
  });
}

function addCompanyVendorPartnership({
  approved_at,
  company_id,
  created_at,
  id,
  updated_at,
  vendor_agreement_id,
  vendor_bank_id,
  vendor_id,
}: CompanyVendorPartnerships) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_vendor_partnership`,
    {
      approved_at: approved_at || null,
      company_id: company_id || null,
      created_at: created_at || null,
      id: id || null,
      updated_at: updated_at || null,
      vendor_agreement_id: vendor_agreement_id || null,
      vendor_bank_id: vendor_bank_id || null,
      vendor_id: vendor_id || null,
    }
  ).then((response) => {
    const companyVendorPartnershipId = !!response?.body?.data
      ?.company_vendor_partnership_id
      ? response.body.data.company_vendor_partnership_id
      : null;

    return cy.wrap(companyVendorPartnershipId);
  });
}

function addContract({
  id,
  company_id,
  product_type,
  start_date,
  end_date,
  adjusted_end_date,
  modified_by_user_id,
  terminated_at,
  terminated_by_user_id,
  is_deleted,

  // Product Config
  contract_financing_terms,
  interest_rate,
  advance_rate,
  maximum_principal_amount,
  max_days_until_repayment,
  late_fee_structure,
  dynamic_interest_rate,
  preceeding_business_day,
  minimum_monthly_amount,
  minimum_quarterly_amount,
  minimum_annual_amount,
  factoring_fee_threshold,
  factoring_fee_threshold_starting_value,
  adjusted_factoring_fee_percentage,
  wire_fee,
  repayment_type_settlement_timeline,
  timezone,
  us_state,

  // LoC only product config
  borrowing_base_accounts_receivable_percentage,
  borrowing_base_inventory_percentage,
  borrowing_base_cash_percentage,
  borrowing_base_cash_in_daca_percentage,
}: Contracts) {
  cy.request("POST", `${Cypress.env("apiServerUrl")}/cypress/add_contract`, {
    id: id || null,
    company_id: company_id || null,
    product_type: product_type || null,
    start_date: start_date || null,
    end_date: end_date || null,
    adjusted_end_date: adjusted_end_date || null,
    modified_by_user_id: modified_by_user_id || null,
    terminated_at: terminated_at || null,
    terminated_by_user_id: terminated_by_user_id || null,
    is_deleted: is_deleted || null,
    contract_financing_terms: contract_financing_terms || null,
    interest_rate: interest_rate || null,
    advance_rate: advance_rate || null,
    maximum_principal_amount: maximum_principal_amount || null,
    max_days_until_repayment: max_days_until_repayment || null,
    late_fee_structure: late_fee_structure || null,
    dynamic_interest_rate: dynamic_interest_rate || null,
    preceeding_business_day: preceeding_business_day || null,
    minimum_monthly_amount: minimum_monthly_amount || null,
    minimum_quarterly_amount: minimum_quarterly_amount || null,
    minimum_annual_amount: minimum_annual_amount || null,
    factoring_fee_threshold: factoring_fee_threshold || null,
    factoring_fee_threshold_starting_value:
      factoring_fee_threshold_starting_value || null,
    adjusted_factoring_fee_percentage:
      adjusted_factoring_fee_percentage || null,
    wire_fee: wire_fee || null,
    repayment_type_settlement_timeline:
      repayment_type_settlement_timeline || null,
    timezone: timezone || null,
    us_state: us_state || null,
    borrowing_base_accounts_receivable_percentage:
      borrowing_base_accounts_receivable_percentage || null,
    borrowing_base_inventory_percentage:
      borrowing_base_inventory_percentage || null,
    borrowing_base_cash_percentage: borrowing_base_cash_percentage || null,
    borrowing_base_cash_in_daca_percentage:
      borrowing_base_cash_in_daca_percentage || null,
  }).then((response) => {
    const contractId = !!response?.body?.data?.contract_id
      ? response.body.data.contract_id
      : null;

    return cy.wrap(contractId);
  });
}

function addFinancialSummary({
  id,
  company_id,
  total_limit,
  total_outstanding_principal,
  total_outstanding_interest,
  total_principal_in_requested_state,
  available_limit,
  total_outstanding_fees,
  adjusted_total_limit,
  date,
  total_outstanding_principal_for_interest,
  minimum_monthly_payload,
  account_level_balance_payload,
  day_volume_threshold_met,
  interest_accrued_today,
  total_amount_to_pay_interest_on,
  product_type,
  needs_recompute,
  days_to_compute_back,
  total_interest_paid_adjustment_today,
  total_fees_paid_adjustment_today,
  total_outstanding_principal_past_due,
  daily_interest_rate,
  minimum_interest_duration,
  minimum_interest_amount,
  minimum_interest_remaining,
  most_overdue_loan_days,
  late_fees_accrued_today,
  loans_info,
}: FinancialSummaries) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_financial_summary`,
    {
      id: id || null,
      company_id: company_id || null,
      total_limit: total_limit || null,
      total_outstanding_principal: total_outstanding_principal || null,
      total_outstanding_interest: total_outstanding_interest || null,
      total_principal_in_requested_state:
        total_principal_in_requested_state || null,
      available_limit: available_limit || null,
      total_outstanding_fees: total_outstanding_fees || null,
      adjusted_total_limit: adjusted_total_limit || null,
      date: date || null,
      total_outstanding_principal_for_interest:
        total_outstanding_principal_for_interest || null,
      minimum_monthly_payload: minimum_monthly_payload || null,
      account_level_balance_payload: account_level_balance_payload || null,
      day_volume_threshold_met: day_volume_threshold_met || null,
      interest_accrued_today: interest_accrued_today || null,
      total_amount_to_pay_interest_on: total_amount_to_pay_interest_on || null,
      product_type: product_type || null,
      needs_recompute: needs_recompute || null,
      days_to_compute_back: days_to_compute_back || null,
      total_interest_paid_adjustment_today:
        total_interest_paid_adjustment_today || null,
      total_fees_paid_adjustment_today:
        total_fees_paid_adjustment_today || null,
      total_outstanding_principal_past_due:
        total_outstanding_principal_past_due || null,
      daily_interest_rate: daily_interest_rate || null,
      minimum_interest_duration: minimum_interest_duration || null,
      minimum_interest_amount: minimum_interest_amount || null,
      minimum_interest_remaining: minimum_interest_remaining || null,
      most_overdue_loan_days: most_overdue_loan_days || null,
      late_fees_accrued_today: late_fees_accrued_today || null,
      loans_info: loans_info || null,
    }
  ).then((response) => {
    const financialSummaryId = !!response?.body?.data?.financial_summary_id
      ? response.body.data.financial_summary_id
      : null;

    return cy.wrap(financialSummaryId);
  });
}

function addPurchaseOrder({
  amount,
  amount_funded,
  amount_updated_at,
  approved_at,
  approved_by_user_id,
  bank_incomplete_note,
  bank_note,
  bank_rejection_note,
  closed_at,
  company_id,
  created_at,
  customer_note,
  delivery_date,
  funded_at,
  id,
  incompleted_at,
  is_cannabis,
  is_deleted,
  is_metrc_based,
  net_terms,
  new_purchase_order_status,
  order_date,
  order_number,
  rejected_at,
  rejected_by_user_id,
  rejection_note,
  requested_at,
  status,
  updated_at,
  vendor_id,
}: PurcaseOrders) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_purchase_order`,
    {
      amount: amount || null,
      amount_funded: amount_funded || null,
      amount_updated_at: amount_updated_at || null,
      approved_at: approved_at || null,
      approved_by_user_id: approved_by_user_id || null,
      bank_incomplete_note: bank_incomplete_note || null,
      bank_note: bank_note || null,
      bank_rejection_note: bank_rejection_note || null,
      closed_at: closed_at || null,
      company_id: company_id || null,
      created_at: created_at || null,
      customer_note: customer_note || null,
      delivery_date: delivery_date || null,
      funded_at: funded_at || null,
      id: id || null,
      incompleted_at: incompleted_at || null,
      is_cannabis: is_cannabis || null,
      is_deleted: is_deleted || null,
      is_metrc_based: is_metrc_based || null,
      net_terms: net_terms || null,
      new_purchase_order_status: new_purchase_order_status || null,
      order_date: order_date || null,
      order_number: order_number || null,
      rejected_at: rejected_at || null,
      rejected_by_user_id: rejected_by_user_id || null,
      rejection_note: rejection_note || null,
      requested_at: requested_at || null,
      status: status || null,
      updated_at: updated_at || null,
      vendor_id: vendor_id || null,
    }
  ).then((response) => {
    const purchaseOrderId = !!response?.body?.data?.purchase_order_id
      ? response.body.data.purchase_order_id
      : null;

    return cy.wrap({
      purchaseOrderId: purchaseOrderId,
    });
  });
}

function addUser({
  company_id,
  company_role,
  created_at,
  email,
  first_name,
  full_name,
  id,
  is_deleted,
  last_name,
  login_method,
  parent_company_id,
  password,
  phone_number,
  role,
  updated_at,
}: Users) {
  cy.request("POST", `${Cypress.env("apiServerUrl")}/cypress/add_user`, {
    company_id: company_id || null,
    company_role: company_role || null,
    created_at: created_at || null,
    email: email || null,
    first_name: first_name || null,
    full_name: full_name || null,
    id: id || null,
    is_deleted: is_deleted || null,
    last_name: last_name || null,
    login_method: login_method || null,
    parent_company_id: parent_company_id || null,
    password: password || null,
    phone_number: phone_number || null,
    role: role || null,
    updated_at: updated_at || null,
  }).then((response) => {
    const userId = !!response?.body?.data?.user_id
      ? response.body.data.user_id
      : null;

    const userEmail = !!response?.body?.data?.user_email
      ? response.body.data.user_email
      : null;

    const userPassword = !!response?.body?.data?.user_password
      ? response.body.data.user_password
      : null;

    return cy.wrap({
      userId: userId,
      userEmail: userEmail,
      userPassword: userPassword,
    });
  });
}

Cypress.Commands.add("addBankAccount", addBankAccount);
Cypress.Commands.add("addContract", addContract);
Cypress.Commands.add("addCompany", addCompany);
Cypress.Commands.add("addCompanyLicense", addCompanyLicense);
Cypress.Commands.add(
  "addCompanyPartnershipRequest",
  addCompanyPartnershipRequest
);
Cypress.Commands.add("updateCompanySettings", updateCompanySettings);
Cypress.Commands.add(
  "addCompanyVendorPartnership",
  addCompanyVendorPartnership
);
Cypress.Commands.add("addFinancialSummary", addFinancialSummary);
Cypress.Commands.add("addPurchaseOrder", addPurchaseOrder);
Cypress.Commands.add("addUser", addUser);

// ///////////////////////////////
// UTILITY ACTIONS
// ///////////////////////////////

function persistentClick(selector: string) {
  cy.get(selector).then(($el) => {
    while (true) {
      if (Cypress.dom.isAttached($el)) {
        console.log($el);
        $el.click();
        break;
      }
      cy.wait(500);
    }
  });
}

function uploadFileSynchronously(inputName: string, isFirst: boolean = false) {
  // Start watching requests.
  cy.server({ method: "POST" });

  cy.intercept("POST", "**/put_signed_url/", {
    status: "OK",
    url: "https://bespoke-platform-for-dev.s3.amazonaws.com/files/customers/0e42f66d-45c4-4a0d-bb8e-ba65b1c57222/ebba_application/20220728-201733-728175/Screen%20Shot%202022-06-22%20at%209.02.34%20AM.png?AWSAccessKeyId=AKIAWKEGJY6TMC7TLZXD&Signature=%2BBussnv6e7XWex38LCSvVcskLA4%3D&content-type=image%2Fpng&Expires=1659040053",
    file_in_db: {
      id: "04b4291d-fbe6-4733-a969-eaffd3a1ff41",
      path: "files/customers/0e42f66d-45c4-4a0d-bb8e-ba65b1c57222/ebba_application/20220728-201733-728175/Screen Shot 2022-06-22 at 9.02.34 AM.png",
    },
    upload_via_server: false,
  });

  cy.intercept("PUT", "**/upload_signed_url").as("uploadSignedUrl");
  cy.intercept("POST", "**/download_signed_url").as("downloadSignedUrl");

  cy.dataCySelector(inputName, "input").attachFile("files/sample.pdf");

  cy.wait("@uploadSignedUrl").its("response.statusCode").should("equal", 200);
  cy.wait("@downloadSignedUrl").its("response.statusCode").should("equal", 200);

  // Stop watching requests.
  cy.server({ enable: false });
}

Cypress.Commands.add("persistentClick", persistentClick);
Cypress.Commands.add("uploadFileSynchronously", uploadFileSynchronously);
