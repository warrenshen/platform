import { password, users } from "../fixtures/logins";

describe("Sign in: multilocation customer user", () => {
  before(() => {
    const parentCompanyId = "369c82d0-c720-4d53-93c0-588d41e958f4";

    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
      parent_company_id: parentCompanyId,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
        product_type: "line_of_credit",
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });

      cy.addCompany({
        is_customer: true,
        parent_company_id: parentCompanyId,
      }).then((results) => {
        cy.addContract({
          company_id: results.companyId,
          product_type: "line_of_credit",
        });
        cy.addFinancialSummary({
          company_id: results.companyId,
        });
        cy.addUser({
          company_id: results.companyId,
          parent_company_id: parentCompanyId,
          role: "company_admin",
        }).then((results) => {
          cy.loginCustomerAdminNew(results.userEmail, results.userPassword);
        });
      });
    });
  });

  it(
    "can sign in with valid email/password",
    {
      retries: 5,
    },
    () => {
      cy.url().should("include", "overview");

      // Verify that the switch location button is present
      cy.dataCy("switch-location-button").should("be.visible");

      cy.dataCy("switch-location-button").click();

      // Open the second location
      cy.dataCy("select-location-button-1").click();

      cy.url().should("include", "overview");
    }
  );
});
