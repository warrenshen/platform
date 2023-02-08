export {};

describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can edit a child company details",
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

      cy.dataCy("company-sidebar-item-company-details").click({ force: true });

      cy.url().should("include", "company-details");

      cy.dataCy("edit-child-company-button").eq(0).click({ force: true });

      cy.dataCy("company-form-input-name").clear().type("Test Change");
      cy.dataCy("company-form-input-identifier").clear().type("TestCH");
      cy.dataCy("company-form-input-dba").clear().type("TCH");
      // US State
      cy.get("[data-cy=us-state-dropdown]").click();
      cy.get("[data-cy*=us-state-dropdown-item]").eq(21).click();

      cy.dataCy("company-form-input-ein").clear().type("128309gh123");
      cy.dataCy("company-form-input-address").clear().type("123 main st");
      cy.dataCy("company-form-input-phone-number").clear().type("123-978-4567");

      cy.dataCy("edit-child-company-modal-submit").click({ force: true });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
      cy.dataCy("child-company-name").contains("Test Change");
      cy.dataCy("child-company-identifier").contains("TestCH");
      cy.dataCy("child-company-dba").contains("TCH");
      cy.dataCy("child-company-state").contains("MA");
      cy.dataCy("child-company-ein").contains("128309gh123");
      cy.dataCy("child-company-address").contains("123 main st");
      cy.dataCy("child-company-phone-number").contains("123-978-4567");
    }
  );
});
