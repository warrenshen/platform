export {};

describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can create a new user for parent company",
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

      cy.dataCy("company-sidebar-item-users").click({ force: true });

      cy.url().should("include", "users");

      cy.dataCy("create-user-button").click({ force: true });

      cy.dataCy("create-parent-company-user-modal-first-name")
        .clear()
        .type("Test");

      cy.dataCy("create-parent-company-user-modal-last-name")
        .clear()
        .type("User");
      cy.dataCy("create-parent-company-user-modal-email")
        .clear()
        .type("test@test.com");
      cy.dataCy("create-parent-company-user-modal-phone-number")
        .click()
        .type("9");
      cy.dataCy("create-parent-company-user-modal-role-select").click();
      cy.dataCy("user-role-select-item-company-admin").click();

      cy.dataCy("create-parent-company-user-modal-submit").click({
        force: true,
      });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
