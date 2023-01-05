import {
  bankUserCreatesCustomerBankAccount,
  bankUserEditsCustomerBankAccount,
} from "@cypress/integration/Bank/BankAccount/flows";

describe("Create and update bank account", () => {
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
    });
  });

  it(
    "Bank user can create bank account with wire only information on behalf of the customer",
    {
      retries: 5,
    },
    () => {
      bankUserCreatesCustomerBankAccount({
        isWire: true,
        isVerified: true,
      });
    }
  );

  it(
    "Bank user can edit bank account with wire only information on behalf of the customer",
    {
      retries: 5,
    },
    () => {
      bankUserEditsCustomerBankAccount({
        isWire: true,
        isVerifiedUpdated: true,
      });
    }
  );
});
