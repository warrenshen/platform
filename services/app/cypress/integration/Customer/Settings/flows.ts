export const inactiveCustomerCannotEditSettingsFlow = () => {
  // Go to Customer > Settings
  cy.dataCy("sidebar-item-settings").click();
  cy.url().should("include", "settings");

  // Verify that the buttons are disabled
  // Bank Accounts
  cy.dataCy("add-bank-account-button").should("be.disabled");
  cy.persistentClick(
    "[data-cy='bank-accounts-data-grid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-bank-account-button").should("be.disabled");

  // Users
  cy.dataCy("create-user-button").should("be.disabled");
  cy.persistentClick(
    "[data-cy='users-data-grid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-user-button").should("be.disabled");
  cy.dataCy("deactivate-user-button").should("be.disabled");
};
