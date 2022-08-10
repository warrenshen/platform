import { deleteLicenseOnMetrcPage } from "./flows";

describe("On Metrc: Deleting a license should", () => {
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
        is_underwriting_enabled: true,
        license_number: "C-0001",
      });
    });
  });

  it(
    "not work when setting isUnderwritting to true",
    {
      retries: 5,
    },
    () => {
      deleteLicenseOnMetrcPage(".MuiAlert-standardError");
    }
  );

  /*
     TODO: Test for facility_row_id null and non null
  */
});
