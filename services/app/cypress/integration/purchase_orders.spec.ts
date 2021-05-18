describe("Create inventory financing customer", () => {
  it("can create customer", () => {
    if (Cypress.env("isDocker") === true) {
      cy.wait(5 * 60 * 1000);
    }

    cy.resetDatabase();
    cy.loginBankAdmin();

    cy.dataCy("sidebar-item-customers").click();
    cy.url().should("include", "customers");

    cy.dataCy("create-customer-button").click();
  });
});

describe("Create purchase order", () => {
  it("can create and save purchase order as draft", () => {
    cy.loginCustomerAdmin();

    cy.visit("/1/purchase-orders");
    cy.url().should("include", "purchase-orders");

    cy.dataCy("create-purchase-order-button").click();

    cy.dataCy("create-purchase-order-modal").should("be.visible");

    cy.dataCy("purchase-order-form-input-vendor").click();
    cy.dataCy("purchase-order-form-input-vendor-menu-item-1").click();
    // TODO(warren): Replace usage of Date.now().toString() in the future.
    cy.dataCySelector("purchase-order-form-input-order-number", "input").type(
      `PO-${Date.now().toString()}`
    );
    cy.dataCySelector("purchase-order-form-input-order-date", "input").type(
      "05/05/2021"
    );
    cy.dataCySelector("purchase-order-form-input-delivery-date", "input").type(
      "05/05/2021"
    );
    cy.dataCySelector("purchase-order-form-input-amount", "input").type(
      "42000"
    );
    cy.dataCySelector(
      "purchase-order-form-input-is-cannabis",
      "input"
    ).uncheck();
    cy.dataCySelector(
      "purchase-order-form-file-uploader-purchase-order-file",
      "input"
    ).attachFile("files/sample.pdf");

    cy.dataCy("create-purchase-order-modal-button-save-and-submit").click();

    cy.dataCy("create-purchase-order-modal").should("not.exist");
  });
});
