export const createVendor = () => {
  cy.contains("Add Vendor").click();
  cy.dataCy("company-name-input").type("Vendor 1");
  cy.dataCy("company-license-input").type("132131242143215325");
  cy.dataCy("company-contact-first-name-input").type("John");
  cy.dataCy("company-contact-last-name-input").type("Connor");
  cy.dataCy("company-contact-email-input").type("johnconnor@customer.com");
  cy.dataCySelector("company-contact-phone-input-container", "input").type(
    "{backspace}+33666666666"
  );
  cy.contains("Submit").click();
};

export const navigateToFirstCustomersPage = () => {
  cy.dataCy("sidebar-item-customers").click();
  cy.dataCy("customers-data-grid-view-customer-button-C1-IF").last().click();
};

export const createCompanyContract = () => {
  cy.dataCy("company-sidebar-item-customer-contract").click();
  cy.contains("Create New Contract").click();
  cy.dataCy("contract-form-input-product-type").click();
  cy.dataCy("contract-form-input-product-type-menu-item-1").click();
  cy.dataCySelector("contract-form-input-start-date", "input").type(
    "05/19/2021"
  );
  cy.dataCySelector("contract-form-input-end-date", "input").type("06/19/2022");
  cy.dataCySelector("contract-terms-form-input-financing-terms", "input").type(
    "1000000"
  );
  cy.dataCySelector("contract-terms-form-input-maximum-amount", "input").type(
    "1000000"
  );
  // Advance rate
  cy.dataCySelector("contract-terms-form-input-advance-rate", "input").type(
    "100"
  );
  // Interest rate
  cy.dataCySelector("contract-terms-form-input-interest-rate", "input").type(
    "0.1"
  );
  // Late fee structure
  cy.dataCySelector(
    "contract-terms-form-input-late-fee-structure-0-0",
    "input"
  ).type("1-14");
  cy.dataCySelector(
    "contract-terms-form-input-late-fee-structure-0-1",
    "input"
  ).type("25");
  cy.dataCy("contract-terms-form-input-late-fee-structure-add-button").click();
  cy.dataCySelector(
    "contract-terms-form-input-late-fee-structure-1-0",
    "input"
  ).type("15-29");
  cy.dataCySelector(
    "contract-terms-form-input-late-fee-structure-1-1",
    "input"
  ).type("50");
  cy.dataCy("contract-terms-form-input-late-fee-structure-add-button").click();
  cy.dataCySelector(
    "contract-terms-form-input-late-fee-structure-2-0",
    "input"
  ).type("30+");
  cy.dataCySelector(
    "contract-terms-form-input-late-fee-structure-2-1",
    "input"
  ).type("100");
  cy.dataCySelector("contract-terms-form-input-wire-fee", "input").type("25");
  cy.dataCySelector("contract-terms-form-input-timezone", "input").type(
    "-7.00{enter}"
  );
  cy.get("[data-cy=us-state-dropdown]").click();
  cy.get("[data-cy*=us-state-dropdown-item]").first().click();
  cy.dataCy("contract-terms-form-input-clearance-days-structure-0-0").click();
  cy.dataCy(
    "contract-terms-form-input-clearance-days-structure-0-0-menu-item-1"
  ).click();
  cy.dataCySelector(
    "contract-terms-form-input-clearance-days-structure-0-1",
    "input"
  ).type("1");
  cy.dataCy(
    "contract-terms-form-input-clearance-days-structure-add-button"
  ).click();
  cy.dataCy("contract-terms-form-input-clearance-days-structure-1-0").click();
  cy.dataCy(
    "contract-terms-form-input-clearance-days-structure-1-0-menu-item-2"
  ).click();
  cy.dataCySelector(
    "contract-terms-form-input-clearance-days-structure-1-1",
    "input"
  ).type("1");
  cy.dataCy(
    "contract-terms-form-input-clearance-days-structure-add-button"
  ).click();
  cy.dataCy("contract-terms-form-input-clearance-days-structure-2-0").click();
  cy.dataCy(
    "contract-terms-form-input-clearance-days-structure-2-0-menu-item-3"
  ).click();
  cy.dataCySelector(
    "contract-terms-form-input-clearance-days-structure-2-1",
    "input"
  ).type("1");

  cy.contains("Save").click();
};
