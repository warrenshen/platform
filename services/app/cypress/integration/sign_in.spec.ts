import logins, { password } from "../fixtures/logins";

describe("Sign in", () => {
  it("can sign in with email/password", () => {
    cy.visit("/");

    cy.dataCySelector("signin-input-email", "input").type(logins.bankAdmin);
    cy.dataCySelector("signin-input-password", "input").type(password);
    cy.dataCy("signin-button").click();

    cy.get("h6").should("contain", "Overview");
  });
});
