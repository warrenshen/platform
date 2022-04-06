import {
  createCompanyContract,
  createVendor,
  navigateToFirstCustomersPage,
} from "./utils";

describe("Creating a new partnership request", () => {
  it("should create a new vendor successfully", () => {
    cy.resetDatabase();
    cy.loginBankAdmin();
    navigateToFirstCustomersPage();
    createCompanyContract();

    cy.dataCy("company-sidebar-item-customer-vendors").click();
    cy.contains("Awaiting Approval").should("not.exist");
    createVendor();
    cy.contains(
      "Vendor request created and Bespoke support staff have been notified"
    ).should("exist");
    cy.contains("Awaiting Approval").should("exist");
  });
});

describe("Deleting the only available partnership request", () => {
  it("should make the awaiting approval data grid disappear", () => {
    cy.loginBankAdmin();

    cy.dataCy("sidebar-item-partnerships").click();
    cy.contains("Vendor 1").should("exist");
    cy.dataCy("partnership-data-grid-container").within(() => {
      cy.get("table > tbody > tr > td div.dx-select-checkbox").first().click();
    });
    cy.contains("Delete Request").click();
    cy.get("button").last().click();
    cy.contains("Vendor 1").should("not.exist");
    navigateToFirstCustomersPage();
    cy.dataCy("company-sidebar-item-customer-vendors").click();
    cy.contains("Awaiting Approval").should("not.exist");
  });
});

describe("Accepting the only available partnership request", () => {
  it("should make the awaiting approval data grid disappear", () => {
    cy.loginBankAdmin();

    navigateToFirstCustomersPage();
    cy.dataCy("company-sidebar-item-customer-vendors").click();
    createVendor();

    cy.dataCy("sidebar-item-partnerships").click();
    cy.contains("Vendor 1").should("exist");
    cy.dataCy("partnership-data-grid-container").within(() => {
      cy.get("table > tbody > tr > td div.dx-select-checkbox").first().click();
    });
    cy.contains("Triage Request").click();
    cy.get("button").last().click();
    cy.contains("Vendor 1").should("not.exist");
    navigateToFirstCustomersPage();
    cy.dataCy("company-sidebar-item-customer-vendors").click();
    cy.contains("Awaiting Approval").should("not.exist");
  });
});
