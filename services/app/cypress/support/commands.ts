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
  cy.visit("/");

  cy.dataCySelector("sign-in-input-email", "input").type(users.bankAdmin);
  cy.dataCySelector("sign-in-input-password", "input").type(password);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

function loginCustomerAdmin() {
  cy.visit("/");

  cy.dataCySelector("sign-in-input-email", "input").type(users.customerAdmin);
  cy.dataCySelector("sign-in-input-password", "input").type(password);
  cy.dataCy("sign-in-button").click();

  cy.url().should("include", "overview");
}

Cypress.Commands.add("loginBankAdmin", loginBankAdmin);
Cypress.Commands.add("loginCustomerAdmin", loginCustomerAdmin);
