export {};

const createCannabisLicense = (
  licenseNumber: string,
  isUnderwrittingEnabled = false
) => {
  cy.contains("Create License").click();
  cy.dataCySelector("company-license-number-input", "input").type(
    licenseNumber
  );

  if (isUnderwrittingEnabled) {
    cy.dataCySelector(
      "company-license-is-underwriting-enabled-checkbox",
      "input"
    ).click();
  }
  cy.dataCy("create-update-company-license-modal-primary-button").click();
};

describe("On Metrc: Create Licenses", () => {
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
    });
  });

  it(
    "Creates licenses",
    {
      retries: 5,
    },
    () => {
      const firstLicenseNumber = "18903821903812093821";
      const secondLicenseNumber = "89164893768493278402";

      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-companies").click();
      cy.url().should("include", "companies");

      cy.dataCy("customers-data-grid-view-customer-button-CC")
        .first()
        .click({ force: true });
      cy.dataCy("company-sidebar-item-general-metrc").click();

      createCannabisLicense(firstLicenseNumber, true);
      createCannabisLicense(secondLicenseNumber);

      // Checks that the licenses appear in the license data grid
      cy.dataCy("company-license-table-container").within(() =>
        cy.contains(firstLicenseNumber).should("exist")
      );
      cy.dataCy("company-license-table-container").within(() =>
        cy.contains(secondLicenseNumber).should("exist")
      );
    }
  );
});
