export const editLicenseOnMetrcPage = () => {
  cy.loginBankAdmin();

  cy.dataCy("sidebar-item-companies").click();
  cy.url().should("include", "companies");

  cy.dataCy("customers-data-grid-view-customer-button-CC").last().click();
  cy.dataCy("company-sidebar-item-general-metrc").click();

  cy.persistentClick(
    ".MuiBox-root[data-cy='company-license-table-container'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-license-button").click();

  // Unchecks isUnderwritting
  cy.dataCySelector(
    "company-license-is-underwriting-enabled-checkbox",
    "input"
  ).click();

  // Saves the changes
  cy.dataCy("create-update-company-license-modal-primary-button").click();

  // Checks that the license update was a success
  cy.get(".MuiAlert-standardSuccess").should("exist");
};

export const deleteLicenseOnMetrcPage = (muiAlertType: string) => {
  cy.loginBankAdmin();

  cy.dataCy("sidebar-item-companies").click();
  cy.url().should("include", "companies");

  cy.dataCy("customers-data-grid-view-customer-button-CC").last().click();
  cy.dataCy("company-sidebar-item-general-metrc").click();

  // Checks last license
  cy.persistentClick(
    ".MuiBox-root[data-cy='company-license-table-container'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("delete-license-button").click();

  // Clicks confirm button
  cy.dataCy("delete-license-modal-primary-button").click();

  // Checks that the license update was a success
  cy.get(muiAlertType).should("exist");
};
