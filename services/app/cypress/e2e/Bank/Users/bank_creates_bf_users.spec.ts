export {};

describe("Create Bank Admin user", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank Admin can create a new Bank Admin",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Settings + Open Modal
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      cy.dataCy("create-bf-user-button").click();

      // Fill out form
      cy.dataCy("invite-user-modal-user-role-select").click();
      cy.dataCy("user-role-select-item-bank-admin").click();
      cy.dataCy("invite-user-modal-first-name").clear().type("Test");
      cy.dataCy("invite-user-modal-last-name").clear().type("Bank Admin User");
      cy.dataCy("invite-user-modal-email").clear().type("test@test.com");
      cy.dataCy("invite-user-modal-phone-number").click().type("1234567890");

      cy.dataCy("invite-user-modal-submit").click({
        force: true,
      });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});

describe("Create Bank Read Only user", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank Admin can create a new Bank Read Only user",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Settings + Open Modal
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      cy.dataCy("create-bf-user-button").click();

      // Fill out form
      cy.dataCy("invite-user-modal-user-role-select").click();
      cy.dataCy("user-role-select-item-bank-user-view-only").click();
      cy.dataCy("invite-user-modal-first-name").clear().type("Test");
      cy.dataCy("invite-user-modal-last-name")
        .clear()
        .type("Bank Read Only User");
      cy.dataCy("invite-user-modal-email").clear().type("test@test.com");
      cy.dataCy("invite-user-modal-phone-number").click().type("1234567890");

      cy.dataCy("invite-user-modal-submit").click({
        force: true,
      });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});

describe("Create Bespoke Catalog Data Entry user", () => {
  before(() => {
    cy.resetDatabase();
  });

  it(
    "Bank Admin can create a new Bespoke Catalog Data Entry user",
    {
      retries: 5,
    },
    () => {
      cy.loginBankAdmin();

      // Go to Bank > Settings + Open Modal
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      cy.dataCy("create-bf-user-button").click();

      // Fill out form
      cy.dataCy("invite-user-modal-user-role-select").click();
      cy.dataCy("user-role-select-item-bespoke-catalog-data-entry").click();
      cy.dataCy("invite-user-modal-first-name").clear().type("Test");
      cy.dataCy("invite-user-modal-last-name")
        .clear()
        .type("Bespoke Catalog Data Entry User");
      cy.dataCy("invite-user-modal-email").clear().type("test@test.com");
      cy.dataCy("invite-user-modal-phone-number").click().type("1234567890");

      cy.dataCy("invite-user-modal-submit").click({
        force: true,
      });

      // successfully edited
      cy.get(".MuiAlert-standardSuccess").should("exist");
    }
  );
});
