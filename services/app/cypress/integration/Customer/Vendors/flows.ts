export const inactiveCustomerCannotInviteVendorFlow = () => {
  // Go to Customer > Vendors
  cy.dataCy("sidebar-item-vendors").click();
  cy.url().should("include", "vendors");

  // Verify that the buttons are disabled
  cy.dataCy("invite-vendor-button").should("be.disabled");
  cy.persistentClick(
    "[data-cy='approved-vendors-table'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-vendor-button").should("be.disabled");
};
