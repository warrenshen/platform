import { inactiveCustomerCannotSubmitFinancialCertificationFlow } from "@cypress/e2e/Customer/BorrowingBase/flows";
import { getTestSetupDates } from "@cypress/e2e/Customer/Loans/flows";

describe("Create purchase order", () => {
  before(() => {
    const { requestedAt, maturityDate } = getTestSetupDates();
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
      product_type: "line_of_credit",
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
        cy.addEbbaApplication({
          company_id: results.companyId,
          category: "financial_report",
          status: "approved",
          application_date: requestedAt,
          expires_date: maturityDate,
          is_deleted: false,
        }).then((ebbaResults) => {
          cy.loginCustomerAdmin(
            companyUserResults.userEmail,
            companyUserResults.userPassword
          );
        });
      });
    });
  });

  it(
    "Inactive customer user cannot submit financial certification",
    {
      retries: 5,
    },
    () => {
      inactiveCustomerCannotSubmitFinancialCertificationFlow();
    }
  );
});
