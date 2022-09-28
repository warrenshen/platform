import {
  getTestSetupDates,
  inactiveCustomerLoansCheckButtonsDisabledFlow,
} from "./flows";

describe("Request financing", () => {
  before(() => {
    const { orderDate, requestedAt, approvedAt, maturityDate } =
      getTestSetupDates();

    cy.resetDatabase();
    cy.addCompany({
      is_customer: true,
    }).then((results) => {
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
            approved_at: approvedAt,
            requested_at: requestedAt,
            approved_by_user_id: userResults.userId,
            order_date: orderDate,
            amount: 88888,
            order_number: "008",
            is_cannabis: true,
            is_metrc_based: false,
            net_terms: 30,
          }).then((purchaseOrderesults) => {
            console.log("purchaseOrderesults", purchaseOrderesults);
            cy.addLoan({
              company_id: results.companyId,
              artifact_id: purchaseOrderesults.purchaseOrderId,
              status: "approval_requested",
              artifact_type: "purchase_order",
              amount: 888,
              identifier: "008",
              maturity_date: maturityDate,
              adjusted_maturity_date: maturityDate,
            });
            cy.addLoan({
              company_id: results.companyId,
              artifact_id: purchaseOrderesults.purchaseOrderId,
              status: "approved",
              approved_at: approvedAt,
              approved_by_user_id: userResults.userId,
              artifact_type: "purchase_order",
              funded_at: approvedAt,
              funded_by_user_id: userResults.userId,
              amount: 999,
              identifier: "009",
              maturity_date: maturityDate,
              adjusted_maturity_date: maturityDate,
            });
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
    "Customer user can submit request for financing payment on the weekday",
    {
      retries: 5,
    },
    () => {
      inactiveCustomerLoansCheckButtonsDisabledFlow();
    }
  );
});
