import { editLicenseOnMetrcPage } from "@cypress/e2e/Bank/CompanyLicenses/flows";

describe("On Metrc: Edit Licenses", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
        product_type: "line_of_credit",
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addCompanyLicense({
        company_id: results.companyId,
        is_underwriting_enabled: false,
        license_number: "C-0001",
      });
    });
  });

  it(
    "works when updating isUnderwritting from false to true",
    {
      retries: 5,
    },
    () => {
      editLicenseOnMetrcPage();
    }
  );
});
