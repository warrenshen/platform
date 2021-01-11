import logins, { password } from "../fixtures/logins";

describe("Sign in", () => {
  it("can sign in with email/password", () => {
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(logins.bankAdmin);
    cy.dataCySelector("sign-in-input-password", "input").type(password);
    cy.dataCy("sign-in-button").click();

    cy.get("h6").should("contain", "Overview");
  });
});
