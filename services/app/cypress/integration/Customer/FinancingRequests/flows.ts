import { getFuturePaymentDate } from "../Loans/flows";

export const createFinancingRequestSingle = () => {
  // Go to Purchase Orders New Tab
  cy.dataCy("sidebar-item-purchase-orders-new").click();
  cy.url().should("include", "purchase-orders");

  // Click checkboxes next to purchase orders
  // We do not encourage cy.wait usage, but something about having 2 data grids
  // on the same tab causes a weird hiccup and waiting a second consistently resolves the issue
  cy.wait(1000).persistentClick(
    ".MuiBox-root[data-cy='ready-to-request-financing-purchase-order-data-grid'] .dx-header-row .dx-select-checkbox"
  );

  // Open ManagePurchaseOrderFinancingModalMultiple
  cy.dataCy("request-financing-button").click();

  // Fill in date
  const { paymentDate } = getFuturePaymentDate();
  cy.dataCy("requested-payment-date-date-picker").type(paymentDate);
  cy.dataCy("financing-request-amount-input").type(10000.0);

  // Submit and check for success snackbar
  cy.dataCy("create-financing-requests-modal-primary-button").click();
  cy.get(".MuiAlert-standardSuccess").should("exist");
};

export const createFinancingRequestMultiple = () => {
  // Go to Purchase Orders New Tab
  cy.dataCy("sidebar-item-purchase-orders-new").click();
  cy.url().should("include", "purchase-orders");

  // Click checkboxes next to purchase orders
  // We do not encourage cy.wait usage, but something about having 2 data grids
  // on the same tab causes a weird hiccup and waiting a second consistently resolves the issue
  cy.wait(1000).persistentClick(
    ".MuiBox-root[data-cy='ready-to-request-financing-purchase-order-data-grid'] .dx-header-row .dx-select-checkbox"
  );

  // Open ManagePurchaseOrderFinancingModalMultiple
  cy.dataCy("request-financing-button").click();

  // Fill in date
  const { paymentDate } = getFuturePaymentDate();
  cy.dataCy("requested-payment-date-date-picker").type(paymentDate);

  // Submit and check for success snackbar
  cy.dataCy("create-multiple-financing-requests-modal-primary-button").click();
  //cy.get(".MuiAlert-standardSuccess").should("exist");
};
