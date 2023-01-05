export {};

describe("Impersonate user", () => {
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
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      });
    });
  });

  it(
    "Bank user can impersonate customer user and undo the impersonation",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Settings
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      // select first user and impersonate them
      cy.persistentClick(
        ".MuiBox-root[data-cy='impersonate-users-data-grid'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
      );
      cy.dataCy("impersonate-user-button").click();

      // verify that we're now on the overview page
      cy.url().should("include", "/1/overview");

      // undo the impersonation
      cy.dataCy("user-profile-icon-button").click();
      cy.dataCy("undo-impersonation-button").click();

      // verifying on overview isn't particularly helpful, but navigating
      // to the companies section, which only the bank view has, is more
      // useful in verifying that we have undone the impersonation
      cy.dataCy("sidebar-item-companies").click();
      cy.url().should("include", "companies");
    }
  );
});
