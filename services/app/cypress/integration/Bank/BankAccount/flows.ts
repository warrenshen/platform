interface CypressBankAccountFlowProps {
  isAch: boolean;
  isWire: boolean;
  isWireIntermediate: boolean;
  isVerifiedCleared: boolean;
  isVerifiedUpdated: boolean;
}

export const bankUserCreatesCustomerBankAccount = ({
  isAch = false,
  isWire = false,
  isWireIntermediate = false,
  isVerified = false,
}: CypressBankAccountFlowProps) => {
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
  cy.dataCy("company-sidebar-item-general-settings").click();
  cy.url().should("include", "settings");

  // Open add bank account modal
  cy.dataCy("add-bank-account-button").click();

  // Fill out form - general bank info
  cy.dataCySelector("bank-account-form-bank-name", "input").type(
    "Cypress Bank"
  );
  cy.dataCySelector("bank-account-form-bank-account-name", "input").type(
    "Cypress Checking"
  );
  cy.dataCy("bank-account-type-dropdown").click();
  cy.dataCy("bank-account-type-dropdown-item").eq(0).click();
  cy.dataCySelector("bank-account-form-account-number", "input").type(
    "0023867512"
  );

  if (isAch) {
    cy.dataCy("bank-account-form-ach-checkbox-container").click();
    cy.dataCySelector("bank-account-form-ach-routing-number", "input").type(
      "66039542"
    );
    cy.dataCySelector("bank-account-form-ach-default-memo", "input").type(
      "Default ACH Memo"
    );
  }

  if (isWire) {
    cy.dataCy("bank-account-form-wire-checkbox-container").click();

    if (isWireIntermediate) {
      cy.dataCy(
        "bank-account-form-intermediary-wire-checkbox-container"
      ).click();
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-name",
        "input"
      ).type("Intermediate Bank");
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-address",
        "input"
      ).type("321 Main Street, Annapolis, MD 21401");
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-account-name",
        "input"
      ).type("Intermediate Checking");
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-account-number",
        "input"
      ).type("79431268");
    }

    cy.dataCySelector("bank-account-form-wire-routing-number", "input").type(
      "66300412"
    );
    cy.dataCySelector("bank-account-form-recipient-address", "input").type(
      "123 Main Street"
    );
    cy.dataCySelector("bank-account-form-recipient-address2", "input").type(
      "Annapolis, MD 21401"
    );
    cy.dataCySelector("bank-account-form-wire-default-memo", "input").type(
      "Default Wire Memo"
    );
  }

  cy.dataCy("bank-account-form-is-company-compliant").click();

  if (isVerified) {
    cy.dataCy("bank-account-form-is-verified").click();
    cy.dataCySelector("bank-account-form-verified-date-picker", "input").type(
      "05/19/2021"
    );
  }

  // Submit and check for success alert
  cy.dataCy("create-update-bank-account-modal-add-button").click();
  cy.get(".MuiAlert-standardSuccess").should("exist");
};

export const bankUserEditsCustomerBankAccount = ({
  isAch = false,
  isWire = false,
  isWireIntermediate = false,
  isVerifiedCleared = false,
  isVerifiedUpdated = false,
}: CypressBankAccountFlowProps) => {
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
  cy.dataCy("company-sidebar-item-general-settings").click();
  cy.url().should("include", "settings");

  // Open edit bank account modal
  cy.persistentClick(
    "[data-cy='bank-accounts-data-grid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-bank-account-button").click();

  // Fill out form - general bank info
  cy.dataCySelector("bank-account-form-bank-name", "input").type("2");
  cy.dataCySelector("bank-account-form-bank-account-name", "input").type("2");
  cy.dataCy("bank-account-type-dropdown").click();
  cy.dataCy("bank-account-type-dropdown-item").eq(1).click();
  cy.dataCySelector("bank-account-form-account-number", "input").type("2");

  if (isAch) {
    cy.dataCySelector("bank-account-form-ach-routing-number", "input").type(
      "2"
    );
    cy.dataCySelector("bank-account-form-ach-default-memo", "input").type("2");
  }

  if (isWire) {
    if (isWireIntermediate) {
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-address",
        "input"
      ).type("2");
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-account-name",
        "input"
      ).type("2");
      cy.dataCySelector(
        "bank-account-form-intermediary-bank-account-number",
        "input"
      ).type("2");
    }

    cy.dataCySelector("bank-account-form-wire-routing-number", "input").type(
      "2"
    );
    cy.dataCySelector("bank-account-form-recipient-address", "input").type("2");
    cy.dataCySelector("bank-account-form-recipient-address2", "input").type(
      "2"
    );
    cy.dataCySelector("bank-account-form-wire-default-memo", "input").type("2");
  }

  cy.dataCy("bank-account-form-is-company-compliant").click();

  if (isVerifiedCleared) {
    cy.dataCySelector(
      "bank-account-form-verified-date-picker",
      "input"
    ).clear();
    cy.dataCy("bank-account-form-is-verified").click();
  }

  if (isVerifiedUpdated) {
    cy.dataCySelector("bank-account-form-verified-date-picker", "input").type(
      "05/20/2021"
    );
  }

  // Submit and check for success alert
  cy.dataCy("create-update-bank-account-modal-add-button").click();
  cy.get(".MuiAlert-standardSuccess").should("exist");
};
