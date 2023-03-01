import { password, users, vendorEmail } from "../fixtures/logins";

describe("Sign in: bank user", () => {
  it(
    "can sign in with valid email/password",
    {
      retries: 5,
    },
    () => {
      cy.resetDatabase();
      cy.visit("/");

      cy.dataCySelector("sign-in-input-email", "input").type(users.bank.admin);
      cy.dataCySelector("sign-in-input-password", "input").type(password);
      cy.dataCy("sign-in-button").click();

      cy.url().should("include", "overview");
    }
  );
});

describe("Sign in: customer user", () => {
  it(
    "can sign in with valid email/password",
    {
      retries: 5,
    },
    () => {
      cy.resetDatabase();
      cy.visit("/");

      cy.dataCySelector("sign-in-input-email", "input").type(
        users.customer.inventoryFinancing.admin
      );
      cy.dataCySelector("sign-in-input-password", "input").type(password);
      cy.dataCy("sign-in-button").click();

      cy.url().should("include", "overview");
    }
  );
});

describe("Sign in: vendor user", () => {
  it(
    "can sign in with valid email/password",
    {
      retries: 5,
    },
    () => {
      cy.resetDatabase();
      cy.visit("/");

      cy.dataCySelector("sign-in-input-email", "input").type(
        users.vendor.admin
      );
      cy.dataCySelector("sign-in-input-password", "input").type(password);
      cy.dataCy("sign-in-button").click();

      cy.url().should("include", "overview");
    }
  );
});

describe("Sign in: company contact for vendor", () => {
  it(
    "can't sign in (company contacts don't have accounts)",
    {
      retries: 5,
    },
    () => {
      cy.resetDatabase();
      cy.visit("/");

      cy.dataCySelector("sign-in-input-email", "input").type(vendorEmail);
      cy.dataCySelector("sign-in-input-password", "input").type("invalid");
      cy.dataCy("sign-in-button").click();

      cy.dataCy("sign-in-error").contains("Error");
      cy.dataCy("sign-in-input-password").should("have.value", "");
    }
  );
});

describe("Sign in: invalid credentials", () => {
  it(
    "should show error message with invalid email/password",
    {
      retries: 5,
    },
    () => {
      cy.resetDatabase();
      cy.visit("/");

      cy.dataCySelector("sign-in-input-email", "input").type(
        users.customer.inventoryFinancing.admin
      );
      cy.dataCySelector("sign-in-input-password", "input").type("invalid");
      cy.dataCy("sign-in-button").click();

      cy.dataCy("sign-in-error").contains("Error");
      cy.dataCy("sign-in-input-password").should("have.value", "");
    }
  );
});
