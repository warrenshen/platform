export {};

describe("Accepting a company partnership request", () => {
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
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      }).then((companyUserResults) => {
        cy.addCompanyPartnershipRequest({
          requested_by_user_id: companyUserResults.userId,
          requesting_company_id: results.companyId,
        });
      });
    });
  });

  it(
    "should be successful",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-partnerships").click();
      cy.persistentClick(
        "[data-cy='partnership-data-grid-container'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
      );

      cy.dataCy("triage-request-button").click();
      cy.dataCy("company-identifier-input").clear().type("XYZ");
      cy.get("button").last().click();

      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
