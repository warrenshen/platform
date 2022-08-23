describe("Creating a new partnership request", () => {
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
    cy.addCompany({
      is_vendor: true,
      name: "Vendor2",
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
        email: "do-not-reply-development+vendor2@bespokefinancial.com",
      });
    });
  });

  it("should create a new vendor partnership with an existing vendor and new contact", () => {
    cy.loginBankAdmin();

    cy.dataCy("sidebar-item-partnerships").click();
    cy.url().should("include", "partnerships");

    cy.persistentClick(
      "[data-cy='partnership-data-grid-container'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
    );
    cy.dataCy("triage-request-button").click();

    cy.dataCy("triage-partnership-request-modal").should("be.visible");

    cy.get("[data-cy=vendor-dropdown]").click();
    cy.contains("Vendor2").click();

    cy.dataCy("triage-partnership-request-modal-primary-button").click();

    cy.get(".MuiAlert-standardSuccess").should("exist");
  });
});
