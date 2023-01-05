/// <reference types="../support"/>
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

import { format } from "date-fns";
import {
  BankAccounts,
  Companies,
  CompanyLicenses,
  CompanyPartnershipRequests,
  CompanySettings,
  CompanyVendorContacts,
  CompanyVendorPartnerships,
  Contracts,
  EbbaApplications,
  Files,
  FinancialSummaries,
  Loans,
  Payments,
  PurchaseOrderFiles,
  PurchaseOrders,
  TwoFactorLinks,
  Users,
} from "generated/graphql";

import { password, users } from "../fixtures/logins";

function dataCy(value: string) {
  cy.get(`[data-cy=${value}]`);
}

Cypress.Commands.add("dataCy", dataCy);

function dataCySelector(value: string, selector: string) {
  cy.get(`[data-cy=${value}] *> ${selector}`);
}

Cypress.Commands.add("dataCySelector", dataCySelector);

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

export type AddBankAccountResult = {
  bankAccountId: string;
};

function addBankAccount(props: Partial<BankAccounts>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_bank_account`,
    props
  ).then((response) => {
    const bankAccountId = !!response?.body?.data?.bank_account_id
      ? response.body.data.bank_account_id
      : null;

    return cy.wrap<AddBankAccountResult>({
      bankAccountId: bankAccountId,
    });
  });
}

export type AddCompanyResults = {
  companyId: string;
  companySettingsId: string;
  parentCompanyId: string;
};

function addCompany(props: Partial<Companies>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company`,
    props
  ).then((response) => {
    const companyId = !!response?.body?.data?.company_id
      ? response.body.data.company_id
      : null;

    const companySettingsId = !!response?.body?.data?.company_settings_id
      ? response.body.data.company_settings_id
      : null;

    const parentCompanyId = !!response?.body?.data?.parent_company_id
      ? response.body.data.parent_company_id
      : null;

    return cy.wrap<AddCompanyResults>({
      companyId: companyId,
      companySettingsId: companySettingsId,
      parentCompanyId: parentCompanyId,
    });
  });
}

export type AddCompanyLicenseResult = {
  companyLicenseId: string;
};

function addCompanyLicense(props: Partial<CompanyLicenses>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_license`,
    props
  ).then((response) => {
    const companyLicenseId = !!response?.body?.data?.company_license_id
      ? response.body.data.company_license_id
      : null;

    return cy.wrap<AddCompanyLicenseResult>({
      companyLicenseId: companyLicenseId,
    });
  });
}

export type AddCompanyPartnershipResult = {
  companyPartnershipRequestId: string;
};

function addCompanyPartnershipRequest(
  props: Partial<CompanyPartnershipRequests>
) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_partnership_request`,
    props
  ).then((response) => {
    const companyPartnershipRequestId = !!response?.body?.data
      ?.company_partnership_request_id
      ? response.body.data.company_partnership_request_id
      : null;

    return cy.wrap<AddCompanyPartnershipResult>({
      companyPartnershipRequestId: companyPartnershipRequestId,
    });
  });
}

export type UpdateCompanySettingsResult = {
  companySettingsId: string;
};

function updateCompanySettings(props: Partial<CompanySettings>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_settings`,
    props
  ).then((response) => {
    const companySettingsId = !!response?.body?.data?.company_settings_id
      ? response.body.data.company_settings_id
      : null;

    return cy.wrap<UpdateCompanySettingsResult>({
      companySettingsId: companySettingsId,
    });
  });
}

export type AddCompanyVendorContactResult = {
  companyVendorContactId: string;
};

function addCompanyVendorContact(props: Partial<CompanyVendorContacts>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_vendor_contact`,
    props
  ).then((response) => {
    const companyVendorContactId = !!response?.body?.data
      ?.company_vendor_contact_id
      ? response.body.data.company_vendor_contact_id
      : null;

    return cy.wrap<AddCompanyVendorContactResult>({
      companyVendorContactId: companyVendorContactId,
    });
  });
}

export type AddCompanyVendorPartnershipResult = {
  companyVendorPartnershipId: string;
};

function addCompanyVendorPartnership(
  props: Partial<CompanyVendorPartnerships>
) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_company_vendor_partnership`,
    props
  ).then((response) => {
    const companyVendorPartnershipId = !!response?.body?.data
      ?.company_vendor_partnership_id
      ? response.body.data.company_vendor_partnership_id
      : null;

    return cy.wrap<AddCompanyVendorPartnershipResult>({
      companyVendorPartnershipId: companyVendorPartnershipId,
    });
  });
}

export type ContractExtraInput = {
  contract_financing_terms: string;
  interest_rate: number;
  advance_rate: number;
  maximum_principal_amount: number;
  max_days_until_repayment: number;
  late_fee_structure: Record<string, string>;
  dynamic_interest_rate: number;
  preceeding_business_day: string;
  minimum_monthly_amount: number;
  minimum_quarterly_amount: number;
  minimum_annual_amount: number;
  factoring_fee_threshold: number;
  factoring_fee_threshold_starting_value: number;
  adjusted_factoring_fee_percentage: number;
  wire_fee: number;
  repayment_type_settlement_timeline: number;
  timezone: string;
  us_state: string;
  borrowing_base_accounts_receivable_percentage: number;
  borrowing_base_inventory_percentage: number;
  borrowing_base_cash_percentage: number;
  borrowing_base_cash_in_daca_percentage: number;
};

export type AddContractResult = {
  contractId: string;
};

function addContract(props: Partial<Contracts> & Partial<ContractExtraInput>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_contract`,
    props
  ).then((response) => {
    const contractId = !!response?.body?.data?.contract_id
      ? response.body.data.contract_id
      : null;

    return cy.wrap<AddContractResult>({
      contractId: contractId,
    });
  });
}

export type AddEbbaApplicationResult = {
  ebbaApplicationId: string;
};

function addEbbaApplication(props: Partial<EbbaApplications>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_ebba_application`,
    props
  ).then((response) => {
    const ebbaApplicationId = !!response?.body?.data?.ebba_application_id
      ? response.body.data.ebba_application_id
      : null;

    return cy.wrap<AddEbbaApplicationResult>({
      ebbaApplicationId: ebbaApplicationId,
    });
  });
}

export type AddFileResult = {
  fileId: string;
};

function addFile(props: Partial<Files>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_file`,
    props
  ).then((response) => {
    const fileId = !!response?.body?.data?.file_id
      ? response.body.data.file_id
      : null;

    return cy.wrap<AddFileResult>({
      fileId: fileId,
    });
  });
}

export type AddFinancialSummaryResult = {
  financialSummaryId: string;
};

function addFinancialSummary(props: Partial<FinancialSummaries>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_financial_summary`,
    props
  ).then((response) => {
    const financialSummaryId = !!response?.body?.data?.financial_summary_id
      ? response.body.data.financial_summary_id
      : null;

    return cy.wrap<AddFinancialSummaryResult>({
      financialSummaryId: financialSummaryId,
    });
  });
}

export type AddLoanResult = {
  loanId: string;
};

function addLoan(props: Partial<Loans>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_loan`,
    props
  ).then((response) => {
    const loanId = !!response?.body?.data?.loan_id
      ? response.body.data.loan_id
      : null;

    return cy.wrap<AddLoanResult>({
      loanId: loanId,
    });
  });
}

export type AddPaymentResult = {
  paymentId: string;
};

function addPayment(props: Partial<Payments>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_payment`,
    props
  ).then((response) => {
    const paymentId = !!response?.body?.data?.paymentId
      ? response.body.data.paymentId
      : null;
    return cy.wrap<AddPaymentResult>({
      paymentId: paymentId,
    });
  });
}

export type PurchaseOrderExtraInput = {
  clear_approved_at?: boolean;
};

export type AddPurchaseOrderResult = {
  purchaseOrderId: string;
};

function addPurchaseOrder(
  props: Partial<PurchaseOrders> & Partial<PurchaseOrderExtraInput>
) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_purchase_order`,
    props
  ).then((response) => {
    const purchaseOrderId = !!response?.body?.data?.purchase_order_id
      ? response.body.data.purchase_order_id
      : null;

    return cy.wrap<AddPurchaseOrderResult>({
      purchaseOrderId: purchaseOrderId,
    });
  });
}

export type AddPurchaseOrderFileResult = {
  purchaseOrderFileId: string;
};

function addPurchaseOrderFile(props: Partial<PurchaseOrderFiles>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_purchase_order_file`,
    props
  ).then((response) => {
    const purchaseOrderFileId = !!response?.body?.data?.purchase_order_file_id
      ? response.body.data.purchase_order_file_id
      : null;

    return cy.wrap<AddPurchaseOrderFileResult>({
      purchaseOrderFileId: purchaseOrderFileId,
    });
  });
}

export type TwoFactorLinksExtraInput = {
  purchase_order_id: string;
  form_type: string;
  form_payload_key: string;
  vendor_email: string;
};

export type AddTwoFactorLinkResult = {
  twoFactorLinkId: string;
};

function addTwoFactorLink(
  props: Partial<TwoFactorLinks> & Partial<TwoFactorLinksExtraInput>
) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_two_factor_link`,
    props
  ).then((response) => {
    const twoFactorLinkId = !!response?.body?.data?.two_factor_link_id
      ? response.body.data.two_factor_link_id
      : null;

    return cy.wrap<AddTwoFactorLinkResult>({
      twoFactorLinkId: twoFactorLinkId,
    });
  });
}

export type AddUserResult = {
  userId: string;
  userEmail: string;
  userPassword: string;
};

function addUser(props: Partial<Users>) {
  cy.request(
    "POST",
    `${Cypress.env("apiServerUrl")}/cypress/add_user`,
    props
  ).then((response) => {
    const userId = !!response?.body?.data?.user_id
      ? response.body.data.user_id
      : null;

    const userEmail = !!response?.body?.data?.user_email
      ? response.body.data.user_email
      : null;

    const userPassword = !!response?.body?.data?.user_password
      ? response.body.data.user_password
      : null;

    return cy.wrap<AddUserResult>({
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
Cypress.Commands.add("addCompanyVendorContact", addCompanyVendorContact);
Cypress.Commands.add(
  "addCompanyVendorPartnership",
  addCompanyVendorPartnership
);
Cypress.Commands.add("addEbbaApplication", addEbbaApplication);
Cypress.Commands.add("addFile", addFile);
Cypress.Commands.add("addFinancialSummary", addFinancialSummary);
Cypress.Commands.add("addLoan", addLoan);
Cypress.Commands.add("addPayment", addPayment);
Cypress.Commands.add("addPurchaseOrder", addPurchaseOrder);
Cypress.Commands.add("addPurchaseOrderFile", addPurchaseOrderFile);
Cypress.Commands.add("addTwoFactorLink", addTwoFactorLink);
Cypress.Commands.add("addUser", addUser);

// ///////////////////////////////
// UTILITY ACTIONS
// ///////////////////////////////

function persistentClick(selector: string) {
  cy.get(selector).then(($el) => {
    while (true) {
      if (Cypress.dom.isAttached($el)) {
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
