describe("Create line of credit contract for existing customer", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addFinancialSummary({
        company_id: results.companyId,
        product_type: "line_of_credit",
      });
    });
  });

  it("can create contract", () => {
    cy.loginBankAdmin();

    cy.dataCy("sidebar-item-customers").click();
    cy.url().should("include", "customers");

    // We need to uncheck the `Is Customer Active?` checbkox
    // since we are testing for setting up their first contract,
    // thus making the customer hidden with this filter
    cy.dataCy("is-customer-active-checkbox").first().click({ force: true });

    cy.dataCy("customers-data-grid-view-customer-button-CC")
      .first()
      .click({ force: true });

    cy.dataCy("company-sidebar-item-customer-contract").click();
    cy.url().should("include", "contract");

    cy.dataCy("create-contract-button").click();

    cy.dataCy("create-contract-modal").should("be.visible");

    // Enter contract non-terms information.
    cy.dataCy("contract-form-input-product-type").click();
    cy.dataCy("contract-form-input-product-type-menu-item-3").click();
    cy.dataCySelector("contract-form-input-start-date", "input").type(
      "05/19/2021"
    );
    // End date should be auto-populated when start date is populated.
    cy.dataCySelector("contract-form-input-end-date", "input").should(
      "not.equal",
      ""
    );

    // Enter contract terms information.
    // Maximum amount
    cy.dataCySelector("contract-terms-form-input-maximum-amount", "input").type(
      "1000000"
    );
    // Borrowing base fields
    cy.dataCySelector(
      "contract-terms-form-input-borrowing-base-accounts-receivable-percentage",
      "input"
    ).type("1000000");
    cy.dataCySelector(
      "contract-terms-form-input-borrowing-base-inventory-percentage",
      "input"
    ).type("500000");
    cy.dataCySelector(
      "contract-terms-form-input-borrowing-base-cash-percentage",
      "input"
    ).type("250000");
    cy.dataCySelector(
      "contract-terms-form-input-borrowing-base-cash-in-daca-percentage",
      "input"
    ).type("250000");
    // Advance rate
    cy.dataCySelector("contract-terms-form-input-advance-rate", "input").type(
      "100"
    );
    // Interest rate
    cy.dataCySelector("contract-terms-form-input-interest-rate", "input").type(
      "0.1"
    );
    // Wire fee
    cy.dataCySelector("contract-terms-form-input-wire-fee", "input").type("25");
    // Timezone
    cy.dataCySelector("contract-terms-form-input-timezone", "input").type(
      "-7.00{enter}"
    );
    // US State
    cy.get("[data-cy=us-state-dropdown]").click();
    cy.get("[data-cy*=us-state-dropdown-item]").eq(21).click();
    // Clearance Days
    cy.dataCy("contract-terms-form-input-clearance-days-structure-0-0").click();
    cy.dataCy(
      "contract-terms-form-input-clearance-days-structure-0-0-menu-item-1"
    ).click();
    cy.dataCySelector(
      "contract-terms-form-input-clearance-days-structure-0-1",
      "input"
    ).type("1");
    cy.dataCy(
      "contract-terms-form-input-clearance-days-structure-add-button"
    ).click();
    cy.dataCy("contract-terms-form-input-clearance-days-structure-1-0").click();
    cy.dataCy(
      "contract-terms-form-input-clearance-days-structure-1-0-menu-item-2"
    ).click();
    cy.dataCySelector(
      "contract-terms-form-input-clearance-days-structure-1-1",
      "input"
    ).type("1");
    cy.dataCy(
      "contract-terms-form-input-clearance-days-structure-add-button"
    ).click();
    cy.dataCy("contract-terms-form-input-clearance-days-structure-2-0").click();
    cy.dataCy(
      "contract-terms-form-input-clearance-days-structure-2-0-menu-item-3"
    ).click();
    cy.dataCySelector(
      "contract-terms-form-input-clearance-days-structure-2-1",
      "input"
    ).type("1");

    cy.dataCy("create-contract-modal-primary-button").click();

    cy.dataCy("create-contract-modal").should("not.exist");
  });
});
