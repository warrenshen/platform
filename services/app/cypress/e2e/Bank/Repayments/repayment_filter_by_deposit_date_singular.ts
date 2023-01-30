export {};

describe("Creating a repayments", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      name: "out_of_range",
      is_customer: true,
    }).then((results) => {
      cy.addPayment({
        company_id: results.companyId,
        type: "repayment",
        method: "wire",
        submitted_at: "10/01/2022",
        deposit_date: "10/01/2022",
        items_covered: {
          loan_ids: ["loan1"],
          payment_option: "pay_in_full",
          requested_to_interest: 0,
          requested_to_principal: 0,
          requested_to_account_fees: 0,
        },
      });
    });
    cy.addCompany({
      is_customer: true,
      name: "day_of_company",
    }).then((results) => {
      cy.addPayment({
        company_id: results.companyId,
        type: "repayment",
        method: "wire",
        submitted_at: "10/07/2022",
        deposit_date: "10/07/2022",
        items_covered: {
          loan_ids: ["loan1"],
          payment_option: "pay_in_full",
          requested_to_interest: 0,
          requested_to_principal: 0,
          requested_to_account_fees: 0,
        },
      });
    });
    cy.addCompany({
      is_customer: true,
      name: "in_range_company",
    }).then((results) => {
      cy.addPayment({
        company_id: results.companyId,
        type: "repayment",
        method: "wire",
        submitted_at: "10/04/2022",
        deposit_date: "10/04/2022",
        items_covered: {
          loan_ids: ["loan1"],
          payment_option: "pay_in_full",
          requested_to_interest: 0,
          requested_to_principal: 0,
          requested_to_account_fees: 0,
        },
      });
    });
  });

  it("should query for only a deposit date range", () => {
    cy.loginBankAdmin();

    cy.dataCy("sidebar-item-repayments").click();
    cy.url().should("include", "payments");

    cy.contains("By Deposit Date").click();

    cy.dataCySelector("repayments-deposit-date-picker-start", "input")
      .clear()
      .type("10/07/2022");

    cy.dataCySelector("repayments-deposit-date-picker-end", "input")
      .clear()
      .type("10/07/2022");

    cy.contains("in_range_company").should("not.exist");
    cy.contains("day_of_company").should("exist");
    cy.contains("out_of_range").should("not.exist");
  });
});
