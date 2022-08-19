export const customerCreatesPurchaseOrderFlow = (
  purchaseOrderNumber: string
) => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  // Create purchase order
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
    "07/31/2022"
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

export const customerCreatesPurchaseOrderFlowNew = (
  purchaseOrderNumber: string
) => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders-new").click();
  cy.url().should("include", "purchase-orders-new");

  // Create purchase order
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
    "07/31/2022"
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

  // Open the Not Confirmed Pos tab
  cy.dataCy("not-confirmed-pos").click();

  cy.persistentClick(
    "table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );

  cy.dataCy("approve-po-button").click();
  cy.dataCy("approve-po-confirm-button").click();
};

export const approvePurchaseOrderAsVendor = (vendorEmail: string) => {
  // Visit the get secure link with email as the val
  cy.visit(`/get-secure-link?val=${vendorEmail}`);

  // Enter the static OTP as 000000
  // 2fa-input
  cy.dataCySelector("2fa-input", "input").type("000000");

  cy.dataCy("continue-review-po").click();
  cy.dataCy("vendor-approve-po").click();

  cy.dataCy("review-bank-information-modal").should("be.visible");
  cy.dataCy("confirm-bank-information").click();
};
