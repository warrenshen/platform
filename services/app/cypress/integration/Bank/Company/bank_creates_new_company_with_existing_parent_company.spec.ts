describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can create a new company with existing parent company",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-companies").click();
      cy.url().should("include", "companies");

      cy.dataCy("companies-tab").first().click({ force: true });
      cy.contains("Create Company").click();

      cy.dataCy("company-form-input-name")
        .clear()
        .type("Existing Parent Company");

      cy.dataCy("company-form-input-identifier").clear().type("ExPa");

      cy.dataCy("company-form-input-dba").clear().type("EPC1");

      cy.contains("Submit").click();

      cy.reload();

      cy.dataCy("companies-tab").first().click({ force: true });

      cy.contains("Create Company").click();

      // Fill out parent company
      cy.dataCy("autocomplete-parent-company")
        .click()
        .type("Existing Parent Company")
        .type("{enter}");

      cy.dataCy("company-form-input-name").clear().type("New Child Company");

      cy.dataCy("company-form-input-identifier").clear().type("NewCh");

      cy.dataCy("company-form-input-dba").clear().type("NCC1");

      cy.contains("Submit").click();

      cy.reload();

      cy.dataCy("companies-tab").first().click({ force: true });

      // successfully created
      cy.dataCy(
        "companies-companies-data-grid-view-customer-button-newch"
      ).should("exist");

      // check parent company does not exist
      cy.dataCy("parent-companies-tab").first().click({ force: true });

      // successfully created
      cy.dataCy(
        "parent-companies-data-grid-view-customer-button-new-child-company"
      ).should("not.exist");
    }
  );
});
