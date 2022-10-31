export const bankAdminCreatePurchaseOrderFlowNew = (
  purchaseOrderNumber: string
) => {
  cy.loginBankAdmin();

  // Go to Bank > Customers
  cy.dataCy("sidebar-item-customers").click();
  cy.url().should("include", "customers");

  // Select Customer
  cy.dataCy("customers-data-grid-view-customer-button-CC")
    .first()
    .click({ force: true });
  cy.url().should("include", "overview");

  // Create purchase order
  cy.dataCy("company-sidebar-item-customer-purchase-orders-new").click();
  cy.url().should("include", "purchase-orders");

  cy.dataCy("create-purchase-order-button").click();
  cy.dataCy("create-purchase-order-modal").should("be.visible");

  // Fill out form
  cy.dataCy("purchase-order-form-autocomplete-vendors").click();
  cy.dataCy("purchase-order-form-autocomplete-vendors").type("{enter}");

  // Fill the rest of the form and hit submit
  cy.dataCySelector("purchase-order-form-input-order-number", "input").type(
    purchaseOrderNumber
  );
  cy.dataCySelector("purchase-order-form-input-order-date", "input").type(
    "10/31/2022"
  );
  cy.get("[data-cy='purchase-order-form-input-net-terms'] input")
    .type("30")
    .type("{enter}");
  cy.dataCy("purchase-order-form-input-amount").type("10000.00");
  cy.dataCy("purchase-order-form-input-customer-note").type("Cypress");
  cy.uploadFileSynchronously(
    "purchase-order-form-file-uploader-purchase-order-file"
  );
  cy.uploadFileSynchronously(
    "purchase-order-form-file-uploader-cannabis-file-attachments"
  );

  // Submit and check for success snackbar
  cy.dataCy("create-purchase-order-modal-primary-button").click();
  cy.get(".MuiAlert-standardSuccess").should("exist");
};
