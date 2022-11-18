import { getTestSetupDates, requestFinancing } from "./flows";

describe("Request financing", () => {
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
        adjusted_total_limit: 10000,
        available_limit: 10000,
        company_id: results.companyId,
        product_type: "inventory_financing",
        total_limit: 10000,
      });

      // Add vendor and purchase order
      cy.addCompany({
        is_vendor: true,
        name: "Cypress Vendor",
      }).then((vendorResults) => {
        // Add user for original customer and log in
        cy.addUser({
          company_id: results.companyId,
          parent_company_id: results.parentCompanyId,
          role: "company_admin",
        }).then((userResults) => {
          cy.addPurchaseOrder({
            company_id: results.companyId,
            vendor_id: vendorResults.companyId,
            status: "approved",
            new_purchase_order_status: "ready_to_request_financing",
            approved_at: approvedAt,
            requested_at: requestedAt,
            approved_by_user_id: userResults.userId,
            order_date: orderDate,
            amount: 440,
            order_number: "004",
            is_cannabis: true,
            is_metrc_based: false,
            net_terms: 30,
          }).then((purchaseOrderesults) => {
            cy.loginCustomerAdminNew(
              userResults.userEmail,
              userResults.userPassword
            );
          });
        });
      });
    });
  });

  it(
    "Customer user cannot submit request for financing payment on the weekend",
    {
      retries: 5,
    },
    () => {
      requestFinancing({
        expectedMuiStatus: ".MuiAlert-standardError",
        weekday: 6,
      });
    }
  );
});
