export const inactiveCustomerCannotSubmitBorrowingBaseFlow = () => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-borrowing-base").click();
  cy.url().should("include", "borrowing-base");

  // Verify that the buttons are disabled
  cy.dataCy("create-borrowing-base-button").should("be.disabled");
  cy.persistentClick(
    "[data-cy='borrowing-base-table'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-borrowing-base-button").should("be.disabled");
  cy.dataCy("delete-borrowing-base-button").should("be.disabled");
};

export const inactiveCustomerCannotSubmitFinancialCertificationFlow = () => {
  // Go to Customer > Financial Certifications
  cy.dataCy("sidebar-item-financial-certifications").click();
  cy.url().should("include", "financial-certifications");

  // Verify that the buttons are disabled
  cy.dataCy("create-financial-report-certification-button").should(
    "be.disabled"
  );
  cy.persistentClick(
    "[data-cy='financial-report-certifications-table'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("edit-certification-button").should("be.disabled");
  cy.dataCy("delete-certification-button").should("be.disabled");
};
