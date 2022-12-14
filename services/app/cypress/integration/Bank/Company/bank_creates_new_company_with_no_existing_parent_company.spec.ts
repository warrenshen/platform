describe("Bank creates a new company", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank user can create a new company with no existing parent company",
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
        .type("New Parent Child Company");

      cy.dataCy("company-form-input-identifier").clear().type("NePaCh");

      cy.dataCy("company-form-input-dba").clear().type("NPC1");

      cy.contains("Submit").click();

      // successfully created
      cy.get(".MuiAlert-standardSuccess").should("exist");

      cy.reload();

      // check parent company exist
      cy.dataCy("companies-tab").first().click({ force: true });

      // successfully created
      cy.dataCy(
        "companies-companies-data-grid-view-customer-button-nepach"
      ).should("exist");

      // check parent company exist
      cy.dataCy("parent-companies-tab").first().click({ force: true });

      // successfully created
      cy.dataCy(
        "parent-companies-data-grid-view-customer-button-new-parent-child-company"
      ).should("exist");
    }
  );
});
