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
    }
  );
});
