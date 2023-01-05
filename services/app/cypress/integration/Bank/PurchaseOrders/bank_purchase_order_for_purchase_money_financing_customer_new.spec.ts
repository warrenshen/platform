import { bankAdminCreatePurchaseOrderFlowNew } from "@cypress/integration/Bank/PurchaseOrders/flows";

describe("Create purchase order", () => {
  before(() => {
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
        product_type: "purchase_money_financing",
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
      });
      cy.addUser({
        company_id: results.companyId,
        parent_company_id: results.parentCompanyId,
        role: "company_admin",
      });
      cy.addBankAccount({
        company_id: results.companyId,
        bank_name: "Customer Bank",
      });

      // Add Vendor and Partnership
      cy.addCompany({
        is_vendor: true,
        name: "Cypress Vendor",
      }).then((vendorResults) => {
        cy.addUser({
          company_id: vendorResults.companyId,
          email: "do-not-reply-development+vendor@bespokefinancial.com",
          parent_company_id: vendorResults.parentCompanyId,
          role: "company_contact_only",
        }).then((vendorUserResults) => {
          cy.addBankAccount({
            company_id: vendorResults.companyId,
            bank_name: "Vendor Bank",
          }).then((vendorBankResults) => {
            cy.addCompanyVendorPartnership({
              company_id: results.companyId,
              vendor_bank_id: vendorBankResults.bankAccountId,
              vendor_id: vendorResults.companyId,
            }).then((partnershipResults) => {
              cy.addCompanyVendorContact({
                partnership_id: partnershipResults.companyVendorPartnershipId,
                vendor_user_id: vendorUserResults.userId,
              });
            });
          });
        });
      });
    });
  });

  it(
    "Bank user can create non-Metrc purchase order on behalf of dispensary financing customer",
    {
      retries: 5,
    },
    () => {
      bankAdminCreatePurchaseOrderFlowNew("A-0001 New");
    }
  );
});
