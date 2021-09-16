describe("Create inventory financing customer", () => {
  it(
    "can create customer",
    {
      retries: {
        runMode: 5,
      },
    },
    () => {
      if (Cypress.env("isDocker") === true) {
        cy.wait(1 * 60 * 1000);
      }

      cy.resetDatabase();
      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-customers").click();
      cy.url().should("include", "customers");

      cy.dataCy("create-customer-button").click();

      cy.dataCy("create-customer-modal").should("be.visible");

      // Enter customer company information.
      cy.dataCySelector("customer-form-input-name", "input").type(
        "Distributor Inc"
      );
      cy.dataCySelector("customer-form-input-identifier", "input").type("DI");
      cy.dataCySelector("customer-form-input-contract-name", "input").type(
        "DISTRIBUTOR, INC."
      );

      // Enter contract non-terms information.
      cy.dataCy("contract-form-input-product-type").click();
      cy.dataCy("contract-form-input-product-type-menu-item-1").click();
      cy.dataCySelector("contract-form-input-start-date", "input").type(
        "05/19/2021"
      );
      // End date should be auto-populated when start date is populated.
      cy.dataCySelector("contract-form-input-end-date", "input").should(
        "not.equal",
        ""
      );

      // Enter contract terms information.
      // Financing terms
      cy.dataCySelector(
        "contract-terms-form-input-financing-terms",
        "input"
      ).type("90");
      // Maximum amount
      cy.dataCySelector(
        "contract-terms-form-input-maximum-amount",
        "input"
      ).type("1000000");
      // Advance rate
      cy.dataCySelector("contract-terms-form-input-advance-rate", "input").type(
        "100"
      );
      // Interest rate
      cy.dataCySelector(
        "contract-terms-form-input-interest-rate",
        "input"
      ).type("0.1");
      // Late fee structure
      cy.dataCySelector(
        "contract-terms-form-input-late-fee-structure-0-0",
        "input"
      ).type("1-29");
      cy.dataCySelector(
        "contract-terms-form-input-late-fee-structure-0-1",
        "input"
      ).type("50");
      cy.dataCy(
        "contract-terms-form-input-late-fee-structure-add-button"
      ).click();
      cy.dataCySelector(
        "contract-terms-form-input-late-fee-structure-1-0",
        "input"
      ).type("30+");
      cy.dataCySelector(
        "contract-terms-form-input-late-fee-structure-1-1",
        "input"
      ).type("100");
      // Wire fee
      cy.dataCySelector("contract-terms-form-input-wire-fee", "input").type(
        "25"
      );
      // Timezone
      cy.dataCySelector("contract-terms-form-input-timezone", "input").type(
        "-7.00{enter}"
      );
      // US State
      cy.get("[data-cy=us-state-dropdown]").click();
      cy.get("[data-cy*=us-state-dropdown-item]").first().click();
      // Clearance Days
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-0-0"
      ).click();
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
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-1-0"
      ).click();
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
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-2-0"
      ).click();
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-2-0-menu-item-3"
      ).click();
      cy.dataCySelector(
        "contract-terms-form-input-clearance-days-structure-2-1",
        "input"
      ).type("1");

      cy.dataCy("create-customer-modal-primary-button").click();

      cy.dataCy("create-customer-modal").should("not.exist");
    }
  );
});

describe("Create line of credit customer", () => {
  it(
    "can create customer",
    {
      retries: {
        runMode: 5,
      },
    },
    () => {
      if (Cypress.env("isDocker") === true) {
        cy.wait(1 * 60 * 1000);
      }

      cy.resetDatabase();
      cy.loginBankAdmin();

      cy.dataCy("sidebar-item-customers").click();
      cy.url().should("include", "customers");

      cy.dataCy("create-customer-button").click();

      cy.dataCy("create-customer-modal").should("be.visible");

      // Enter customer company information.
      cy.dataCySelector("customer-form-input-name", "input").type(
        "Distributor Inc"
      );
      cy.dataCySelector("customer-form-input-identifier", "input").type("DI");
      cy.dataCySelector("customer-form-input-contract-name", "input").type(
        "DISTRIBUTOR, INC."
      );

      // Enter contract non-terms information.
      cy.dataCy("contract-form-input-product-type").click();
      cy.dataCy("contract-form-input-product-type-menu-item-0").click();
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
      cy.dataCySelector(
        "contract-terms-form-input-maximum-amount",
        "input"
      ).type("1000000");
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
      cy.dataCySelector(
        "contract-terms-form-input-interest-rate",
        "input"
      ).type("0.1");
      // Wire fee
      cy.dataCySelector("contract-terms-form-input-wire-fee", "input").type(
        "25"
      );
      // Timezone
      cy.dataCySelector("contract-terms-form-input-timezone", "input").type(
        "-7.00{enter}"
      );
      // US State
      cy.get("[data-cy=us-state-dropdown]").click();
      cy.get("[data-cy*=us-state-dropdown-item]").first().click();
      // Clearance Days
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-0-0"
      ).click();
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
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-1-0"
      ).click();
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
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-2-0"
      ).click();
      cy.dataCy(
        "contract-terms-form-input-clearance-days-structure-2-0-menu-item-3"
      ).click();
      cy.dataCySelector(
        "contract-terms-form-input-clearance-days-structure-2-1",
        "input"
      ).type("1");

      cy.dataCy("create-customer-modal-primary-button").click();

      cy.dataCy("create-customer-modal").should("not.exist");
    }
  );
});
