// Tests covering for the Metrc page

describe("On Metrcs: Create Licenses", () => {
  it(
    "Creates licenses",
    {
      retries: {
        runMode: 5,
      },
    },
    () => {
      if (Cypress.env("isDocker") === true) {
        cy.wait(1 * 60 * 1000);
      }

      const firstLicenseNumber = "18903821903812093821";
      const secondLicenseNumber = "89164893768493278402";

      cy.resetDatabase();
      cy.loginBankAdmin();

      navigateToCompanyMetrc();
      createMetrcLicense(firstLicenseNumber, true);
      createMetrcLicense(secondLicenseNumber);

      // Checks that the licenses appear in the license data grid
      cy.dataCy("company-license-table-container").within(() =>
        cy.contains(firstLicenseNumber).should("exist")
      );
      cy.dataCy("company-license-table-container").within(() =>
        cy.contains(secondLicenseNumber).should("exist")
      );
    }
  );
});

describe("On Metrcs: Edit License button should", () => {
  it("be disabled if no license is selected", () => {
    cy.contains("Edit License").should("be.disabled");
  });

  it("be disabled if more than one license is selected", () => {
    cy.dataCy("company-license-table-container").within(() => {
      cy.get("table > tbody > tr > td div.dx-select-checkbox").first().click();
    });
    cy.contains("Edit License").should("be.disabled");
  });

  it("be enabled if one license is selected", () => {
    cy.dataCy("company-license-table-container").within(
      clickFirstLicenseCheckbox
    );
    cy.contains("Edit License").should("not.be.disabled");
  });
});

describe("On Metrcs: Delete License button should", () => {
  it("be disabled if no license is selected", () => {
    uncheckLicenses();
    cy.contains("Delete License").should("be.disabled");
  });

  it("be disabled if more than one license is selected", () => {
    cy.dataCy("company-license-table-container").within(() => {
      cy.get("table > tbody > tr > td div.dx-select-checkbox").first().click();
    });
    cy.contains("Delete License").should("be.disabled");
  });

  it("be enabled if one license is selected", () => {
    cy.dataCy("company-license-table-container").within(
      clickFirstLicenseCheckbox
    );
    cy.contains("Delete License").should("not.be.disabled");
  });
});

describe("On Metrcs: Editing a license should", () => {
  beforeEach(() => {
    cy.loginBankAdmin();
    navigateToCompanyMetrc();
    clickFirstLicenseCheckbox();
    cy.contains("Edit License").click();
    cy.intercept({
      method: "POST",
      url: "/v1/graphql",
    }).as("editLicense");
  });

  it("work when setting isUnderwritting to true", () => {
    // Unchecks isUnderwritting
    cy.dataCySelector(
      "company-license-is-underwriting-enabled-checkbox",
      "input"
    ).click();

    // Saves the changes
    cy.dataCy("create-update-company-license-modal-primary-button").click();

    // Checks that the license update was a success
    cy.wait("@editLicense");
    cy.get(".MuiAlert-message").contains("Success").should("exist");
  });

  it("work when setting isUnderwritting to false", () => {
    // Checks isUnderwritting
    cy.dataCySelector(
      "company-license-is-underwriting-enabled-checkbox",
      "input"
    ).click();

    // Saves the changes
    cy.dataCy("create-update-company-license-modal-primary-button").click();

    // Checks that the license update was a success
    cy.wait("@editLicense");
    cy.get(".MuiAlert-message").contains("Success").should("exist");
  });
});

describe("On Metrcs: Deleting a license should", () => {
  beforeEach(() => {
    cy.loginBankAdmin();
    navigateToCompanyMetrc();
    cy.intercept({
      method: "POST",
      url: "/licenses/delete_license",
    }).as("deleteLicense");
  });

  it("not work when setting isUnderwritting to true", () => {
    // Checks first license checkbox
    clickFirstLicenseCheckbox();

    cy.contains("Delete License").click();

    // Clicks confirm button
    cy.contains("Confirm").click();

    // Checks that the license update failed and shows the expected error
    cy.wait("@deleteLicense");
    cy.get(".MuiAlert-message").contains("Error").should("exist");
    cy.get(".MuiAlert-message")
      .contains("Cannot delete a license that is underwriting enabled")
      .should("exist");
    cy.get(".MuiAlert-message").contains("Success").should("not.exist");
  });

  it("work when setting isUnderwritting to false", () => {
    // Checks last license
    clickLastLicenseCheckbox();

    cy.contains("Delete License").click();

    // Clicks confirm button
    cy.contains("Confirm").click();

    // Checks that the license update was a success
    cy.wait("@deleteLicense");
    cy.get(".MuiAlert-message").contains("Error").should("not.exist");
    cy.get(".MuiAlert-message").contains("Success").should("exist");
  });

  /*
     TODO: Test for facility_row_id null and non null
  */
});

// Tests covering for the Settings page

describe("On Settings: Create Licenses", () => {
  it(
    "Creates licenses",
    {
      retries: {
        runMode: 5,
      },
    },
    () => {
      if (Cypress.env("isDocker") === true) {
        cy.wait(1 * 60 * 1000);
      }
      cy.intercept({
        method: "POST",
        url: "/licenses/create_update_licenses",
      }).as("createLicense");

      const firstLicenseNumber = "48937248927658207528";
      const secondLicenseNumber = "20907105730573802570";

      cy.loginBankAdmin();

      navigateToCompanySettings();

      createSettingsLicenses([firstLicenseNumber, secondLicenseNumber]);

      cy.wait("@createLicense");

      // Checks that the licenses appear in the license data grid
      cy.dataCy("company-license-table-container").within(() =>
        cy.contains(firstLicenseNumber).should("exist")
      );
      cy.dataCy("company-license-table-container").within(() =>
        cy.contains(secondLicenseNumber).should("exist")
      );
    }
  );
});

describe("On Settings: Delete License button should", () => {
  it("be disabled if no license is selected", () => {
    uncheckLicenses();
    cy.contains("Delete License").should("be.disabled");
  });

  it("be disabled if more than one license is selected", () => {
    cy.dataCy("company-license-table-container").within(() => {
      cy.get("table > tbody > tr > td div.dx-select-checkbox").first().click();
    });
    cy.contains("Delete License").should("be.disabled");
  });

  it("be enabled if one license is selected", () => {
    cy.dataCy("company-license-table-container").within(
      clickFirstLicenseCheckbox
    );
    cy.contains("Delete License").should("not.be.disabled");
  });
});

describe("On Settings: Deleting a license should", () => {
  beforeEach(() => {
    cy.loginBankAdmin();
    navigateToCompanySettings();
    cy.intercept({
      method: "POST",
      url: "/licenses/delete_license",
    }).as("deleteLicense");
  });

  it("not work when setting isUnderwritting to true", () => {
    // Checks first license
    clickFirstLicenseCheckbox();

    cy.contains("Delete License").click();

    // Clicks confirm button
    cy.contains("Confirm").click();

    // Checks that the license update failed and shows the expected error
    cy.wait("@deleteLicense");
    cy.get(".MuiAlert-message").contains("Error").should("exist");
    cy.get(".MuiAlert-message")
      .contains("Cannot delete a license that is underwriting enabled")
      .should("exist");
    cy.get(".MuiAlert-message").contains("Success").should("not.exist");
  });

  it("work when setting isUnderwritting to false", () => {
    // Checks last license
    clickLastLicenseCheckbox();

    cy.contains("Delete License").click();

    // Clicks confirm button
    cy.contains("Confirm").click();

    // Checks that the license update was a success
    cy.wait("@deleteLicense");
    cy.get(".MuiAlert-message").contains("Error").should("not.exist");
    cy.get(".MuiAlert-message").contains("Success").should("exist");
  });

  /*
     TODO: Test for facility_row_id null and non null
  */
});

const uncheckLicenses = () => {
  cy.dataCy("company-license-table-container").within(() => {
    cy.get("table > tbody > tr > td div.dx-select-checkbox").first().click();
  });
};

const navigateToCompanyMetrc = () => {
  cy.dataCy("sidebar-item-customers").click();
  cy.url().should("include", "customers");

  cy.dataCy("customers-data-grid-view-customer-button-C1-IF").last().click();
  cy.dataCy("company-sidebar-item-general-metrc").click();
};

const navigateToCompanySettings = () => {
  cy.dataCy("sidebar-item-customers").click();
  cy.url().should("include", "customers");

  cy.dataCy("customers-data-grid-view-customer-button-C1-IF").last().click();
  cy.dataCy("company-sidebar-item-general-settings").click();
};

const clickFirstLicenseCheckbox = () =>
  cy
    .get(".dx-datagrid-rowsview table > tbody > tr > td div.dx-select-checkbox")
    .first()
    .click();

const clickLastLicenseCheckbox = () =>
  cy
    .get(".dx-datagrid-rowsview table > tbody > tr > td div.dx-select-checkbox")
    .last()
    .click();

const createMetrcLicense = (
  licenseNumber: string,
  isUnderwrittingEnabled = false
) => {
  cy.contains("Create License").click();
  cy.dataCySelector("company-license-number-input", "input").type(
    licenseNumber
  );

  if (isUnderwrittingEnabled) {
    cy.dataCySelector(
      "company-license-is-underwriting-enabled-checkbox",
      "input"
    ).click();
  }
  cy.dataCy("create-update-company-license-modal-primary-button").click();
};

const createSettingsLicenses = (licensesNumber: string[]) => {
  cy.contains("Edit Licenses").click();

  licensesNumber.forEach((licenseNumber) => {
    cy.dataCy("add-license-button").click();
    cy.dataCySelector("license-number-input", "input")
      .last()
      .type(licenseNumber);
  });
  cy.contains("Save").click();
};
