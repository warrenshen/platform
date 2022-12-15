describe("Bank Account Creation", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      }).then((results) => {
        cy.loginCustomerAdminNew(results.userEmail, results.userPassword);
      });
    });
  });

  it(
    "Customer can created bank account",
    {
      retries: 5,
    },
    () => {
      // Go to Customer > Settings
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      // Open add bank account modal
      cy.dataCy("add-bank-account-button").click();

      // Fill out form - general bank info
      cy.dataCySelector("bank-account-form-bank-name", "input").type(
        "Cypress Bank"
      );
      cy.dataCySelector("bank-account-form-bank-account-name", "input").type(
        "Cypress Checking"
      );
      cy.dataCy("bank-account-type-dropdown").click();
      cy.dataCy("bank-account-type-dropdown-item").eq(0).click();
      cy.dataCySelector("bank-account-form-account-number", "input").type(
        "0023867512"
      );

      cy.dataCy("bank-account-form-ach-checkbox-container").click();
      cy.dataCySelector("bank-account-form-ach-routing-number", "input").type(
        "66039542"
      );
      cy.dataCySelector("bank-account-form-ach-default-memo", "input").type(
        "Default ACH Memo"
      );

      // Submit and check for success alert
      cy.dataCy("create-update-bank-account-modal-add-button").click();
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
