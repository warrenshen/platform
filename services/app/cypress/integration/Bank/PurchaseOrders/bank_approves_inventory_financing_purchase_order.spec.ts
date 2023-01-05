import { approvePurchaseOrderAsBankAdmin } from "@cypress/integration/Bank/PurchaseOrders/flows";
import { getTestSetupDates } from "@cypress/integration/Customer/Loans/flows";

describe("Create purchase order", () => {
  before(() => {
    const { orderDate, requestedAt, approvedAt } = getTestSetupDates();
    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
      cy.addContract({
        company_id: results.companyId,
        product_type: "inventory_financing",
      });
      cy.addFinancialSummary({
        company_id: results.companyId,
        available_limit: 100000,
        adjusted_total_limit: 100000,
        total_limit: 100000,
        product_type: "inventory_financing",
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
          }).then((userResults) => {
            cy.addPurchaseOrder({
              company_id: results.companyId,
              vendor_id: vendorResults.companyId,
              status: "approved",
              new_purchase_order_status: "pending_approval_by_vendor",
              approved_at: approvedAt,
              requested_at: requestedAt,
              approved_by_user_id: userResults.userId,
              order_date: orderDate,
              amount: 10000,
              order_number: "007-10000",
              is_cannabis: true,
              is_metrc_based: false,
              net_terms: 30,
            });
            cy.addBankAccount({
              company_id: vendorResults.companyId,
              bank_name: "Vendor Bank",
            }).then((vendorBankAccountId) => {
              cy.addCompanyVendorPartnership({
                company_id: results.companyId,
                vendor_bank_id: vendorBankAccountId.bankAccountId,
                vendor_id: vendorResults.companyId,
              }).then((partnershipResults) => {
                cy.addCompanyVendorContact({
                  partnership_id: partnershipResults.companyVendorPartnershipId,
                  vendor_user_id: userResults.userId,
                });
              });
            });
          });
        });
      });
    });
  });

  it(
    "Bank admin can approve a purchase order",
    {
      retries: 5,
    },
    () => {
      approvePurchaseOrderAsBankAdmin();
    }
  );
});
