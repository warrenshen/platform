/// <reference types="cypress" />
import {
  BankAccounts,
  Companies,
  CompanyLicenses,
  CompanyPartnershipRequests,
  CompanySettings,
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
} from "@app/generated/graphql";

import {
  AddBankAccountResult,
  AddCompanyLicenseResult,
  AddCompanyPartnershipResult,
  AddCompanyResult,
  AddCompanyVendorContactResult,
  AddCompanyVendorPartnershipResult,
  AddContractResult,
  AddFileResult,
  AddFinancialSummaryResult,
  AddLoanResult,
  AddPaymentResult,
  AddPurchaseOrderFileResult,
  AddPurchaseOrderResult,
  AddUserResult,
  ContractExtraInput,
  PurchaseOrderExtraInput,
  TwoFactorLinksExtraInput,
  UpdateCompanySettingsResult,
} from "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Pre-flight data addition for cypress test
       * @example cy.addBankAccount({ stuff } : BankAccounts)
       */
      addBankAccount(value: BankAccounts): Chainable<AddBankAccountResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addCompany({ stuff } : BankAccounts)
       */
      addCompany(value: Companies): Chainable<AddCompanyResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addCompanyLicense({ stuff } : CompanyLicenses)
       */
      addCompanyLicense(
        value: CompanyLicenses
      ): Chainable<AddCompanyLicenseResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addCompanyPartnershipRequests({ stuff } : CompanyPartnershipRequests)
       */
      addCompanyPartnershipRequest(
        value: CompanyPartnershipRequests
      ): Chainable<AddCompanyPartnershipResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addCompanySettings({ stuff } : CompanySettings)
       */
      updateCompanySettings(
        value: CompanySettings
      ): Chainable<UpdateCompanySettingsResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addCompanyVendorContact({ stuff } : CompanyVendorContact)
       */
      addCompanyVendorContact(
        value: CompanyVendorContact
      ): Chainable<AddCompanyVendorContactResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addCompanyVendorPartnerships({ stuff } : CompanyVendorPartnerships)
       */
      addCompanyVendorPartnership(
        value: CompanyVendorPartnerships
      ): Chainable<AddCompanyVendorPartnershipResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addContract({ stuff } : Contracts)
       */
      addContract(
        value: Contracts & ContractExtraInput
      ): Chainable<AddContractResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addEbbaApplication({ stuff } : EbbaApplications)
       */
      addEbbaApplication(
        value: EbbaApplications
      ): Chainable<AddEbbaApplicationResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addFile({ stuff } : Files)
       */
      addFile(value: Files): Chainable<AddFileResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addFinancialSummary({ stuff } : FinancialSummaries)
       */
      addFinancialSummary(
        value: FinancialSummaries
      ): Chainable<AddFinancialSummaryResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addLoan({ stuff } : Loans)
       */
      addLoan(value: Loans): Chainable<AddLoanResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addPayment({ stuff } : Payments)
       */
      addPayment(value: Payments): Chainable<AddPaymentResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addPurchaseOrder({ stuff } : PurchaseOrders)
       */
      addPurchaseOrder(
        value: PurchaseOrders & PurchaseOrderExtraInput
      ): Chainable<AddPurchaseOrderResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addPurchaseOrderFile({ stuff } : PurchaseOrderFiles)
       */
      addPurchaseOrderFile(
        value: PurchaseOrderFiles
      ): Chainable<AddPurchaseOrderFileResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addTwoFactorLink({ stuff } : TwoFactorLinks)
       */
      addTwoFactorLink(
        value: TwoFactorLinks & TwoFactorLinksExtraInput
      ): Chainable<AddTwoFactorLinkResult>;

      /**
       * Pre-flight data addition for cypress test
       * @example cy.addUser({ stuff } : Users)
       */
      addUser(value: Users): Chainable<AddUserResult>;

      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<Element>;
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCySelector('greeting')
       */
      dataCySelector(value: string, selector: string): Chainable<Element>;

      /**
       * Have the test log in as a bank admin
       * Intended to be used with a bank admin setup by seed.py
       * @example cy.loginBankAdmin()
       */
      loginBankAdmin(): Chainable<Element>;

      /**
       * Have the test log in as a vendor admin
       * Intended to be used with a vendor admin setup by seed.py
       * @example cy.loginVendorAdmin()
       */
      loginVendorAdmin(
        userEmail: string,
        userPassword: string
      ): Chainable<Element>;

      /**
       * Have the test log in as a customer admin
       * Intended to be used with a customer admin setup by cy.addUser
       * @example cy.loginCustomerAdminNeew()
       */
      loginCustomerAdmin(
        userEmail: string,
        userPassword: string
      ): Chainable<Element>;

      /**
       * Have the test log out
       * @example cy.logout()
       */
      logout(): Chainable<Element>;

      /**
       * Brute force command used to get around Cypress' difficulty
       * selecting a checkbox in the devextreme datagrid
       * @example cy.persistentClick('greeting')
       */
      persistentClick(value: string): Chainable<Element>;

      /**
       * Brute force command used to get around Cypress' difficulty
       * selecting a checkbox in the devextreme datagrid
       * @example cy.persistentClick('greeting')
       */
      persistentClick(value: string): Chainable<Element>;

      /**
       * Should be used before running a new test
       * @example cy.resetDatabase()
       */
      resetDatabase(): Chainable<Element>;

      /**
       * Used for the file upload area. Needs to be synchronous to make
       * sure that the file upload is finalizing before clicking the
       * form's submit button
       * @example cy.uploadFileSynchronously(someFile, isFirst = true)
       */
      uploadFileSynchronously(
        inputName: string,
        isFirst: boolean = false
      ): Chainable<Element>;

      /**
       * TODO: Should be removed once the imports are fixed and can grab from lib/date.ts
       * This further implies its usage will need to pull from lib/date.ts as well
       */
      todayAsDateStringClient(): string;
    }
  }
}
