describe("Create purchase order", () => {
  it("can create and save purchase order as draft", () => {
    cy.loginCustomerAdmin();

    cy.visit("/1/purchase-orders");
    cy.url().should("include", "purchase-orders");

    cy.dataCy("create-purchase-order-button").click();

    cy.dataCySelector("create-purchase-order-input-order-number", "input").type(
      "PO123123123"
    );
    cy.dataCySelector("create-purchase-order-input-order-date", "input").type(
      "05/05/2021"
    );
    cy.dataCySelector(
      "create-purchase-order-input-delivery-date",
      "input"
    ).type("05/05/2021");
    cy.dataCySelector("create-purchase-order-input-amount", "input").type(
      "42000"
    );
    cy.dataCySelector(
      "create-purchase-order-input-is-cannabis",
      "input"
    ).uncheck();
  });
});
