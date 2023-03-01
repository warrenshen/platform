import { getTestSetupDates } from "@cypress/e2e/Customer/Loans/flows";
import { inactiveCustomerCreatesPurchaseOrderFlow } from "@cypress/e2e/Customer/PurchaseOrders/flows";

describe("Create purchase order", () => {
  before(() => {
    const { orderDate, requestedAt, approvedAt } = getTestSetupDates();
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
          }).then((userResults) => {
            cy.addPurchaseOrder({
              company_id: results.companyId,
              vendor_id: vendorResults.companyId,
              status: "approved",
              new_purchase_order_status: "draft",
              approved_at: approvedAt,
              requested_at: requestedAt,
              approved_by_user_id: userResults.userId,
              order_date: orderDate,
              amount: 440,
              order_number: "004",
              is_cannabis: true,
              is_metrc_based: false,
              net_terms: 30,
            });
            cy.addPurchaseOrder({
              company_id: results.companyId,
              vendor_id: vendorResults.companyId,
              status: "drafted",
              new_purchase_order_status: "ready_to_request_financing",
              approved_at: null,
              requested_at: requestedAt,
              order_date: orderDate,
              amount: 440,
              order_number: "004",
              is_cannabis: true,
              is_metrc_based: false,
              net_terms: 30,
            });
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
    "Inactive customer user cannot create purchase order",
    {
      retries: 5,
    },
    () => {
      inactiveCustomerCreatesPurchaseOrderFlow();
    }
  );
});
