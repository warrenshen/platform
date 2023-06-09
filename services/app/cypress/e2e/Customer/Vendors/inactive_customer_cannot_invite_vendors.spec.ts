import { inactiveCustomerCannotInviteVendorFlow } from "@cypress/e2e/Customer/Vendors/flows";

describe("Create purchase order", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
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
      }).then((companyUserResults) => {
        // Add Vendor and Partnership
        cy.addCompany({
          is_vendor: true,
          name: "Cypress Vendor",
        }).then((vendorResults) => {
          cy.addUser({
            company_id: vendorResults.companyId,
            email: "vendor@bespokefinancial.com",
            parent_company_id: vendorResults.parentCompanyId,
            role: "company_contact_only",
          });

          cy.addBankAccount({
            company_id: vendorResults.companyId,
            bank_name: "Vendor Bank",
          }).then((vendorBankResults) => {
            cy.addCompanyVendorPartnership({
              company_id: results.companyId,
              vendor_bank_id: vendorBankResults.bankAccountId,
              vendor_id: vendorResults.companyId,
            });
            cy.loginCustomerAdmin(
              companyUserResults.userEmail,
              companyUserResults.userPassword
            );
          });
        });
      });
    });
  });

  it(
    "Inactive customer user cannot invite or edit vendor",
    {
      retries: 5,
    },
    () => {
      inactiveCustomerCannotInviteVendorFlow();
    }
  );
});
