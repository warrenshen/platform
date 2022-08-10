describe("On Metrc: Edit Licenses Pre-flight Checks", () => {
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
        license_number: "C-0001",
      });
      cy.addCompanyLicense({
        company_id: results.companyId,
        license_number: "C-0002",
      });
    });
  });

  it(
    "navigate to Metrc tab for testing",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-customers").click();
      cy.url().should("include", "customers");

      cy.dataCy("customers-data-grid-view-customer-button-CC")
        .first()
        .click({ force: true });
      cy.dataCy("company-sidebar-item-general-metrc").click();
    }
  );

  it("action buttons should be disabled if no license is selected", () => {
    cy.dataCy("delete-license-button").should("be.disabled");
    cy.dataCy("edit-license-button").should("be.disabled");
  });

  it(
    "be enabled if one license is selected",
    {
      retries: 5,
    },
    () => {
      cy.persistentClick(
        ".MuiBox-root[data-cy='company-license-table-container'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
      );
      cy.dataCy("delete-license-button").should("not.be.disabled");
      cy.dataCy("edit-license-button").should("not.be.disabled");
    }
  );

  it(
    "action buttons should be disabled if more than one license is selected",
    {
      retries: 5,
    },
    () => {
      cy.persistentClick(
        ".MuiBox-root[data-cy='company-license-table-container'] .dx-header-row .dx-select-checkbox"
      );
      cy.dataCy("delete-license-button").should("be.disabled");
      cy.dataCy("edit-license-button").should("be.disabled");
    }
  );
});
