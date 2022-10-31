describe("Setup borrowing base", () => {
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
        product_type: "line_of_credit",
      });
    });
  });

  it(
    "Bank user can submit borrowing base on behalf of customer",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Customers
      cy.dataCy("sidebar-item-customers").click();
      cy.url().should("include", "customers");

      // Select Customer
      cy.dataCy("customers-data-grid-view-customer-button-CC")
        .first()
        .click({ force: true });
      cy.url().should("include", "overview");

      // Go to Customer > Borrowing Base
      cy.dataCy("company-sidebar-item-borrowing-base").click();
      cy.url().should("include", "borrowing-base");

      // Open create modal
      cy.dataCy("create-borrowing-base-button").click();

      // Fill out form
      cy.dataCySelector("borrow-base-modal-date-picker", "input").type(
        "01/31/2022"
      );
      cy.dataCySelector(
        "borrowing-base-modal-accounts-receivable",
        "input"
      ).type("500000.00");
      cy.dataCySelector("borrowing-base-modal-inventory-balance", "input").type(
        "400000.00"
      );
      cy.dataCySelector("borrowing-base-modal-cash", "input").type("300000.00");
      cy.dataCySelector("borrowing-base-modal-cash-daca", "input").type(
        "200000.00"
      );
      cy.dataCySelector("borrowing-base-modal-custom-amount", "input").type(
        "10.00"
      );
      cy.dataCySelector(
        "borrowing-base-modal-custom-amount-text",
        "input"
      ).type("Cypress");
      cy.uploadFileSynchronously("borrowing-base-modal-file-uploader");
      cy.dataCy("modal-calculated-borrowing-base").should(
        "not.have.value",
        "Calculated Borrowing Base: TBD"
      );

      // Submit and check for success snackbar
      cy.dataCy("submit-borrowing-base-modal-primary-button").click();
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );

  it(
    "Bank user can edit borrowing base on behalf of customer",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Customers
      cy.dataCy("sidebar-item-customers").click();
      cy.url().should("include", "customers");

      // Select Customer
      cy.dataCy("customers-data-grid-view-customer-button-CC")
        .first()
        .click({ force: true });
      cy.url().should("include", "overview");

      // Go to Customer > Borrowing Base
      cy.dataCy("company-sidebar-item-borrowing-base").click();
      cy.url().should("include", "borrowing-base");

      // Open create modal
      cy.get(
        "table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
      ).click();
      cy.dataCy("edit-borrowing-base-button").click();

      cy.dataCySelector(
        "borrowing-base-modal-accounts-receivable",
        "input"
      ).type("501000.07");
      cy.dataCySelector("borrowing-base-modal-inventory-balance", "input").type(
        "401000.07"
      );
      cy.dataCySelector("borrowing-base-modal-cash", "input").type("300000.00");
      cy.dataCySelector("borrowing-base-modal-cash-daca", "input").type(
        "201000.07"
      );
      cy.dataCySelector("borrowing-base-modal-custom-amount", "input").type(
        "10.07"
      );
      cy.dataCySelector(
        "borrowing-base-modal-custom-amount-text",
        "input"
      ).type("Cypress Edit");
      cy.uploadFileSynchronously("borrowing-base-modal-file-uploader");
      cy.dataCy("modal-calculated-borrowing-base").should(
        "not.have.value",
        "Calculated Borrowing Base: TBD"
      );

      // Submit and check for success snackbar
      cy.dataCy("submit-borrowing-base-modal-primary-button").click();
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
