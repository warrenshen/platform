export {};

describe("Impersonate Vendor user", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: false,
      is_vendor: true,
    }).then((results) => {
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "vendor_admin",
      });
    });
  });

  it(
    "Bank user can impersonate vendor user and undo the impersonation",
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

      // verify that we're now on the vendor overview page
      cy.url().should("include", "/2/overview");

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
