export {};

describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can edit parent company details",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-companies").click();
      cy.url().should("include", "companies");

      // check parent company exist
      cy.dataCy("parent-companies-tab").first().click({ force: true });

      cy.dataCy(
        "parent-companies-data-grid-view-customer-button-inventory-financing-customer"
      ).click({ force: true });
      cy.url().should("include", "details");

      cy.dataCy("edit-parent-company-button").click({ force: true });

      cy.dataCy("company-form-input-name").clear().type("Test Change");

      cy.dataCy("edit-parent-company-modal-submit").click({ force: true });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
      cy.dataCy("parent-company-name").contains("Test Change");
    }
  );
});
