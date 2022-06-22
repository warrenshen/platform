import { password, users } from "../fixtures/logins";
describe("Sign in: multilocation customer user", () => {
  it("can sign in with valid email/password", () => {
    cy.resetDatabase();
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(
      users.customer.multiLocation.admin
    );
    cy.dataCySelector("sign-in-input-password", "input").type(password);
    cy.dataCy("sign-in-button").click();

    cy.url().should("include", "overview");

    // Verify that the switch location button is present
    cy.dataCy("switch-location-button").should("be.visible");

    cy.dataCy("switch-location-button").click();

    // Open the second location
    cy.dataCy("select-location-button-1").click();
  });
});
