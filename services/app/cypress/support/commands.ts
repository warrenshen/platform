// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import "cypress-file-upload";
import { password, users } from "../fixtures/logins";
declare global {
  namespace Cypress {
    interface Chainable {
      loginBankAdmin: typeof loginBankAdmin;
      loginCustomerAdmin: typeof loginCustomerAdmin;
      resetDatabase: typeof resetDatabase;
    }
  }
}

Cypress.Commands.add("dataCy", (value) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add("dataCySelector", (value, selector) => {
  return cy.get(`[data-cy=${value}] *> ${selector}`);
});

function loginBankAdmin() {
  cy.visit("/", { timeout: 5 * 60 * 1000 });

  cy.dataCySelector("sign-in-input-email", "input").type(users.bank.admin);
  cy.dataCySelector("sign-in-input-password", "input").type(password);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

function loginCustomerAdmin() {
  cy.visit("/", { timeout: 5 * 60 * 1000 });

  cy.dataCySelector("sign-in-input-email", "input").type(
    users.customer.inventoryFinancing.admin
  );
  cy.dataCySelector("sign-in-input-password", "input").type(password);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

function resetDatabase() {
  cy.request("POST", `${Cypress.env("apiServerUrl")}/cypress/reset_database`);
}

Cypress.Commands.add("loginBankAdmin", loginBankAdmin);
Cypress.Commands.add("loginCustomerAdmin", loginCustomerAdmin);
Cypress.Commands.add("resetDatabase", resetDatabase);
