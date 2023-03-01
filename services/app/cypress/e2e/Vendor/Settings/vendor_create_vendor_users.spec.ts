export {};

describe("Create Vendor Admin user", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: false,
      is_vendor: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addBankAccount({
        company_id: results.companyId,
        bank_name: "Customer Bank",
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      }).then((results) => {
        cy.loginVendorAdmin(results.userEmail, results.userPassword);
      });
    });
  });

  it(
    "Vendor Admin can create a new Vendor Admin",
    {
      retries: 5,
    },
    () => {
      // Go to Settings + Open Modal
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      cy.dataCy("create-user-button").click();

      // Fill out form
      cy.dataCy("invite-user-modal-user-role-select").click();
      cy.dataCy("user-role-select-item-vendor-admin").click();
      cy.dataCy("invite-user-modal-first-name").clear().type("Test");
      cy.dataCy("invite-user-modal-last-name")
        .clear()
        .type("Vendor Admin User");
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

describe("Create Company (Customer) and Vendor Admin user", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
      is_vendor: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addBankAccount({
        company_id: results.companyId,
        bank_name: "Customer Bank",
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      }).then((results) => {
        cy.loginCustomerAdmin(results.userEmail, results.userPassword);
      });
    });
  });

  it(
    "Vendor Admin can create a new Company (Customer) and Vendor Admin user if the company is a customer and vendor",
    {
      retries: 5,
    },
    () => {
      // Go to Settings + Open Modal
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      cy.dataCy("create-user-button").click();

      // Fill out form
      cy.dataCy("invite-user-modal-user-role-select").click();
      cy.dataCy("user-role-select-item-company-and-vendor-admin").click();
      cy.dataCy("invite-user-modal-first-name").clear().type("Test");
      cy.dataCy("invite-user-modal-last-name")
        .clear()
        .type("Company and Vendor Admin");
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

describe("Non-Customer Vendor Company can't create joint user", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: false,
      is_vendor: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addBankAccount({
        company_id: results.companyId,
        bank_name: "Customer Bank",
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      }).then((results) => {
        cy.loginCustomerAdmin(results.userEmail, results.userPassword);
      });
    });
  });

  it(
    "Vendor Admin can't select Company (Customer) and Vendor Admin user if the company is not a customer",
    {
      retries: 5,
    },
    () => {
      // Go to Settings + Open Modal
      cy.dataCy("sidebar-item-settings").click();
      cy.url().should("include", "settings");

      cy.dataCy("create-user-button").click();

      // Fill out form
      cy.dataCy("invite-user-modal-user-role-select").click();
      cy.dataCy("user-role-select-item-company-and-vendor-admin").should(
        "not.exist"
      );
    }
  );
});
