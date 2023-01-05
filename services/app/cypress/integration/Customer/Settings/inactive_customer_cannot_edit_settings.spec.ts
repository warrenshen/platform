import { inactiveCustomerCannotEditSettingsFlow } from "@cypress/integration/Customer/Settings/flows";

describe("Inactive customer cannot edit settings", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addBankAccount({
        company_id: results.companyId,
        bank_name: "Customer Bank",
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      }).then((companyUserResults) => {
        cy.loginCustomerAdminNew(
          companyUserResults.userEmail,
          companyUserResults.userPassword
        );
      });
    });
  });

  it(
    "Inactive customer user cannot update settings",
    {
      retries: 5,
    },
    () => {
      inactiveCustomerCannotEditSettingsFlow();
    }
  );
});
