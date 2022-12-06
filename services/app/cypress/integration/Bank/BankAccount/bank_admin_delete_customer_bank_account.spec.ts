import {
  bankUserCreatesCustomerBankAccount,
  bankUserEditsCustomerBankAccount,
} from "./flows";

describe("Delete bank account", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
        product_type: "line_of_credit",
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addBankAccount({
        company_id: results.companyId,
      });
    });
  });

  it(
    "Bank user can create bank account with wire only information on behalf of the customer",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Customers
      cy.dataCy("sidebar-item-companies").click();
      cy.url().should("include", "companies");

      // Select Customer
      cy.dataCy("customers-data-grid-view-customer-button-CC")
        .first()
        .click({ force: true });
      cy.url().should("include", "overview");

      // Go to Customer > Borrowing Base
      cy.dataCy("company-sidebar-item-general-settings").click();
      cy.url().should("include", "settings");

      // Open edit bank account modal
      cy.persistentClick(
        "[data-cy='bank-accounts-data-grid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
      );
      cy.dataCy("delete-bank-account-button").click();

      cy.dataCy("delete-bank-account-modal-primary-button").click();
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
