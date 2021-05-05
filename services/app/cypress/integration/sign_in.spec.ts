import { password, users } from "../fixtures/logins";

describe("Sign in: bank user", () => {
  it("can sign in with email/password", () => {
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(users.bankAdmin);
    cy.dataCySelector("sign-in-input-password", "input").type(password);
    cy.dataCy("sign-in-button").click();

    cy.url().should('include', 'overview');
  });
});

describe("Sign in: customer user", () => {
  it("can sign in with email/password", () => {
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(users.customerAdmin);
    cy.dataCySelector("sign-in-input-password", "input").type(password);
    cy.dataCy("sign-in-button").click();

    cy.url().should('include', 'overview');
  });
});
