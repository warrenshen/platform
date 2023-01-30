export {};

describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can deactive and reactivate a parent company user.",
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

      // deactivate a user
      cy.dataCy("parent-company-active-users-data-grid")
        .get(".dx-select-checkbox")
        .eq(1)
        .click();

      cy.dataCy("deactivate-user-button").click({ force: true });

      cy.dataCy("deactivate-user-modal-submit-button").click({ force: true });

      cy.reload();

      cy.dataCy("parent-company-active-users-data-grid")
        .find(".dx-select-checkbox")
        .should("have.length", 2);

      cy.dataCy("deactived-tab").click({ force: true });

      cy.dataCy("parent-company-deactivated-users-data-grid")
        .find(".dx-select-checkbox")
        .should("have.length", 2);

      // reactivate a user
      cy.dataCy("parent-company-deactivated-users-data-grid")
        .get(".dx-select-checkbox")
        .eq(1)
        .click();

      cy.dataCy("reactivate-user-button").click({ force: true });

      cy.dataCy("reactivate-user-modal-submit-button").click({ force: true });

      cy.reload();

      cy.dataCy("deactived-tab").click({ force: true });

      cy.contains("No deactivated users to show");
    }
  );
});
