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
      cy.dataCySelector(
        "contract-terms-form-input-financing-terms",
        "input"
      ).type("90");
      cy.dataCySelector(
        "contract-terms-form-input-maximum-amount",
        "input"
      ).type("1000000");
      cy.dataCySelector("contract-terms-form-input-advance-rate", "input").type(
        "100"
      );
    }
  );
});

// describe("Create purchase order", () => {
//   it("can create and save purchase order as draft", () => {
//     cy.loginCustomerAdmin();

//     cy.visit("/1/purchase-orders");
//     cy.url().should("include", "purchase-orders");

//     cy.dataCy("create-purchase-order-button").click();

//     cy.dataCy("create-purchase-order-modal").should("be.visible");

//     cy.dataCy("purchase-order-form-input-vendor").click();
//     cy.dataCy("purchase-order-form-input-vendor-menu-item-1").click();
//     // TODO(warren): Replace usage of Date.now().toString() in the future.
//     cy.dataCySelector("purchase-order-form-input-order-number", "input").type(
//       `PO-${Date.now().toString()}`
//     );
//     cy.dataCySelector("purchase-order-form-input-order-date", "input").type(
//       "05/05/2021"
//     );
//     cy.dataCySelector("purchase-order-form-input-delivery-date", "input").type(
//       "05/05/2021"
//     );
//     cy.dataCySelector("purchase-order-form-input-amount", "input").type(
//       "42000"
//     );
//     cy.dataCySelector(
//       "purchase-order-form-input-is-cannabis",
//       "input"
//     ).uncheck();
//     cy.dataCySelector(
//       "purchase-order-form-file-uploader-purchase-order-file",
//       "input"
//     ).attachFile("files/sample.pdf");

//     cy.dataCy("create-purchase-order-modal-button-save-and-submit").click();

//     cy.dataCy("create-purchase-order-modal").should("not.exist");
//   });
// });
