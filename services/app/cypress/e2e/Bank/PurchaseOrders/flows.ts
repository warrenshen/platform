import { dateAsDateStringClient } from "lib/date";

export const bankAdminCreatePurchaseOrderFlowNew = (
  purchaseOrderNumber: string
) => {
  const todayString = dateAsDateStringClient(new Date());

  cy.loginBankAdmin();

  // Go to Bank > Companies
  cy.dataCy("sidebar-item-companies").click();
  cy.url().should("include", "companies");

  // Select Customer
  cy.dataCy("customers-data-grid-view-customer-button-CC")
    .first()
    .click({ force: true });
  cy.url().should("include", "overview");

  // Create purchase order
  cy.dataCy("company-sidebar-item-customer-purchase-orders").click();
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
    todayString
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

export const approvePurchaseOrderAsBankAdmin = () => {
  cy.loginBankAdmin();

  // Approve purchase order
  cy.visit("/purchase-orders");

  // Open the Not Ready for Financing tab
  cy.dataCy("not-ready-for-financing-tab").click();

  cy.persistentClick(
    "[data-cy='incomplete-purchase-orders-data-grid-container'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );

  cy.dataCy("approve-as-vendor-button").click();
  cy.dataCy("vendor-approve-po-modal-confirm-button").click();
};
