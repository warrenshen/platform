export {};

describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can edit an existing user for parent company",
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

      cy.dataCy("parent-company-active-users-data-grid")
        .get(".dx-select-checkbox")
        .eq(1)
        .click();

      cy.dataCy("edit-user-button").click({ force: true });

      cy.dataCy("edit-user-modal-first-name").clear().type("Test");

      cy.dataCy("edit-user-modal-last-name").clear().type("User");
      cy.dataCy("edit-user-modal-email").clear().type("test@test.com");
      cy.dataCy("edit-user-modal-phone-number").click().type("9");

      cy.dataCy("edit-user-modal-submit-button").click({ force: true });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
