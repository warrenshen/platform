import { password, users } from "../fixtures/logins";

describe("Sign in: bank user", () => {
  it("can sign in with valid email/password", () => {
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(users.bankAdmin);
    cy.dataCySelector("sign-in-input-password", "input").type(password);
    cy.dataCy("sign-in-button").click();

    cy.url().should("include", "overview");
  });
});

describe("Sign in: customer user", () => {
  it("can sign in with valid email/password", () => {
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(users.customerAdmin);
    cy.dataCySelector("sign-in-input-password", "input").type(password);
    cy.dataCy("sign-in-button").click();

    cy.url().should("include", "overview");
  });
});

describe("Sign in: invalid credentials", () => {
  it("should show error message with invalid email/password", () => {
    cy.visit("/");

    cy.dataCySelector("sign-in-input-email", "input").type(users.customerAdmin);
    cy.dataCySelector("sign-in-input-password", "input").type("invalid");
    cy.dataCy("sign-in-button").click();

    cy.dataCy("sign-in-error").contains("Error");
    cy.dataCy("sign-in-input-password").should("have.value", "");
  });
});
