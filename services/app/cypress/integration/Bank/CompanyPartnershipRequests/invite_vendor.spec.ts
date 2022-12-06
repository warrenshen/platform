describe("Creating a new partnership request", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
        product_type: "inventory_financing",
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
    });
  });

  it("should create a new vendor successfully", () => {
    cy.loginBankAdmin();

    // Go to Bank > Companies
    cy.dataCy("sidebar-item-companies").click();
    cy.url().should("include", "companies");

    // Select Customer
    cy.dataCy("customers-data-grid-view-customer-button-CC")
      .first()
      .click({ force: true });
    cy.url().should("include", "overview");

    cy.dataCy("company-sidebar-item-customer-vendors").click();

    cy.dataCy("invite-vendor-button").click();
    cy.dataCy("invite-vendor-modal-vendor-name-input").type("Vendor 1");
    cy.dataCy("invite-vendor-modal-vendor-email-input").type(
      "vendor@bespokefinancial.com"
    );

    // Submit
    cy.dataCy("invite-vendor-modal-primary-button").click();
    cy.get(".MuiAlert-standardSuccess").should("exist");
  });
});
