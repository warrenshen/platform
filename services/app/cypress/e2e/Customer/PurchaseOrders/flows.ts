import { getFuturePaymentDate } from "../Loans/flows";

interface SetupProps {
  productType: string;
  setupPurchaseOrderToSubmitOrEdit: boolean;
  purchaseOrderOldStatus: string;
  setupPurchaseOrder: boolean;
  shouldLogin: boolean;
}

export const setupDataForTest = ({
  productType,
  setupPurchaseOrderToSubmitOrEdit = false,
  purchaseOrderOldStatus = "draft",
  setupPurchaseOrder = false,
  shouldLogin = true,
}: Partial<SetupProps>) => {
  cy.resetDatabase();
  cy.addCompany({
    is_customer: true,
  }).then((results) => {
    cy.addContract({
      company_id: results.companyId,
      product_type: productType,
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
        }).then((vendorUserResults) => {
          if (setupPurchaseOrderToSubmitOrEdit) {
            cy.addPurchaseOrder({
              approved_at: null,
              company_id: results.companyId,
              vendor_id: vendorResults.companyId,
              order_number: "Cypress-2",
              new_purchase_order_status: purchaseOrderOldStatus,
              clear_approved_at: true,
            }).then((purchaseOrderDraftResults) => {
              cy.addFile({
                company_id: results.companyId,
              }).then((fileResults1) => {
                cy.addPurchaseOrderFile({
                  purchase_order_id: purchaseOrderDraftResults.purchaseOrderId,
                  file_id: fileResults1.fileId,
                });
              });
              cy.addFile({
                company_id: results.companyId,
              }).then((fileResults2) => {
                cy.addPurchaseOrderFile({
                  purchase_order_id: purchaseOrderDraftResults.purchaseOrderId,
                  file_id: fileResults2.fileId,
                  file_type: "cannabis",
                });
              });
            });
          }

          if (setupPurchaseOrder) {
            cy.addPurchaseOrder({
              company_id: results.companyId,
              vendor_id: vendorResults.companyId,
              order_number: "Cypress-3",
              new_purchase_order_status: "pending_approval_by_vendor",
            }).then((purchaseOrdeResults1) => {
              cy.addTwoFactorLink({
                purchase_order_id: purchaseOrdeResults1.purchaseOrderId,
              });
            });

            cy.addPurchaseOrder({
              company_id: results.companyId,
              vendor_id: vendorResults.companyId,
              order_number: "Cypress-4",
              new_purchase_order_status: "pending_approval_by_vendor",
            }).then((purchaseOrdeResults2) => {
              cy.addTwoFactorLink({
                purchase_order_id: purchaseOrdeResults2.purchaseOrderId,
              });
            });
          }
          cy.addBankAccount({
            company_id: vendorResults.companyId,
            bank_name: "Vendor Bank",
          }).then((vendorBankAccountResults) => {
            cy.addCompanyVendorPartnership({
              company_id: results.companyId,
              vendor_bank_id: vendorBankAccountResults.bankAccountId,
              vendor_id: vendorResults.companyId,
            }).then((partnershipResults) => {
              cy.addCompanyVendorContact({
                partnership_id: partnershipResults.companyVendorPartnershipId,
                vendor_user_id: vendorUserResults.userId,
                is_active: true,
              });

              if (shouldLogin) {
                cy.loginCustomerAdminNew(
                  companyUserResults.userEmail,
                  companyUserResults.userPassword
                );
              }
            });
          });
        });
      });
    });
  });
};

interface ArchiveFlowProps {
  datagrid: string;
}

export const customerArchivesPurchaseOrderFlow = ({
  datagrid,
}: ArchiveFlowProps) => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  cy.persistentClick(
    `[data-cy='${datagrid}'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox`
  );

  cy.dataCy("archive-not-ready-po-button").click();
  cy.dataCy("archive-po-confirm-button").click();
  cy.get(".MuiAlert-standardSuccess").should("exist");

  // Reload and check for purchase with appropriate status
  cy.reload();
  cy.dataCy("archived-tab").click();
};

interface EditFlowProps {
  shouldSubmit: boolean; // submit vs save as draft
}

export const customerEditsPurchaseOrderFlow = ({
  shouldSubmit = true,
}: Partial<EditFlowProps>) => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  cy.persistentClick(
    "[data-cy='not-ready-to-request-financing-data-grid'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );

  cy.dataCy("edit-not-ready-po-button").click();

  cy.dataCy("purchase-order-form-input-order-number")
    .clear()
    .type("Cypress-1-Edit");

  // TODO(JR): Once we re-configure our build config, I want to revisit
  // this. As it stands, we hand a lot of date functions copied from
  // the main codebase. I don't want to add more unless it's essential
  // for the test to make sense
  // cy.dataCy("purchase-order-form-input-order-date")
  //   .clear()
  //   .type()

  cy.dataCy("purchase-order-form-input-net-terms")
    .clear()
    .type("60")
    .type("{enter}");

  cy.dataCy("purchase-order-form-input-amount")
    .clear()
    .type(Number(5432.01).toString());

  cy.dataCy("purchase-order-form-input-customer-note")
    .clear()
    .type("editing flow");

  if (shouldSubmit) {
    cy.dataCy("create-purchase-order-modal-primary-button").click();
    cy.get(".MuiAlert-standardSuccess").should("exist");
  } else {
    cy.dataCy("create-purchase-order-modal-secondary-button").click();
  }
};

interface CreateFlowProps {
  purchaseOrderNumber: string;
  modalButtonDataCy: string;
  expectedResultStatus: string;
}

export const customerSubmitsDraftPurchaseOrder = () => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  //cy.wait(1000);
  cy.persistentClick(
    "[data-cy='not-ready-to-request-financing-data-grid'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );

  cy.dataCy("submit-to-vendor-button").click();
  cy.get(".MuiAlert-standardSuccess").should("exist");
};

export const inactiveCustomerCreatesPurchaseOrderFlow = () => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  // Check purchase order action buttons are disabled for inactive customer
  // (Not Ready to Request Financing)
  cy.get(
    "[data-cy='not-ready-to-request-financing-data-grid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  ).click();

  cy.dataCy("create-purchase-order-button").should("be.disabled");
  cy.dataCy("edit-not-ready-po-button").should("be.disabled");
  cy.dataCy("archive-not-ready-po-button").should("be.disabled");
  cy.dataCy("submit-to-vendor-button").should("be.disabled");

  // (Ready to Request Financing)
  cy.get(
    "[data-cy='ready-to-request-financing-purchase-order-data-grid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  ).click();
  cy.dataCy("archive-ready-po-button").should("be.disabled");
  cy.dataCy("request-financing-button").should("be.disabled");
};

export const customerCreatesPurchaseOrderFlowNew = ({
  purchaseOrderNumber,
  modalButtonDataCy,
  expectedResultStatus,
}: CreateFlowProps) => {
  // Go to Customer > Borrowing Base
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  // Create purchase order
  cy.dataCy("create-purchase-order-button").click();

  cy.dataCy("create-purchase-order-modal").should("be.visible");

  // Fill out form
  cy.dataCy("purchase-order-form-autocomplete-vendors").click();
  cy.dataCy("purchase-order-form-autocomplete-vendors").type("{enter}");

  // Fill the rest of the form and hit submit
  cy.dataCySelector("purchase-order-form-input-order-number", "input").type(
    purchaseOrderNumber
  );
  const { paymentDate } = getFuturePaymentDate();
  cy.dataCySelector("purchase-order-form-input-order-date", "input").type(
    paymentDate
  );
  cy.get("[data-cy='purchase-order-form-input-net-terms'] input")
    .type("30")
    .type("{enter}");
  cy.dataCy("purchase-order-form-input-amount").type("10000.00");
  cy.dataCy("purchase-order-form-input-customer-note").type("Cypress");
  cy.uploadFileSynchronously(
    "purchase-order-form-file-uploader-purchase-order-file"
  );
  cy.uploadFileSynchronously(
    "purchase-order-form-file-uploader-cannabis-file-attachments"
  );

  // Submit and check for success snackbar
  cy.dataCy(modalButtonDataCy).click();
  cy.get(".MuiAlert-standardSuccess").should("exist");

  // Reload and check for purchase with appropriate status
  cy.reload();
  cy.get(
    "[data-cy='not-ready-to-request-financing-data-grid'] tr[aria-rowindex='1'] td[aria-colindex='3'] p.MuiTypography-root"
  ).contains(expectedResultStatus);
};

export const approvePurchaseOrderAsBankAdmin = () => {
  cy.loginBankAdmin();

  // Approve purchase order
  cy.visit("/purchase-orders");

  // Open the Not Ready for Financing tab
  cy.dataCy("not-ready-for-financing-tab").click();

  cy.persistentClick(
    "[data-cy='incomplete-purchase-orders-data-grid-container'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );

  cy.dataCy("approve-as-vendor-button").click();
  cy.dataCy("vendor-approve-po-modal-confirm-button").click();
};

export const approvePurchaseOrderAsVendor = (vendorEmail: string) => {
  // Visit the get secure link with email as the val
  cy.visit(`/get-secure-link-new?val=${vendorEmail}`);

  // Enter the static OTP as 000000
  // 2fa-input
  cy.dataCySelector("2fa-input", "input").type("000000");

  cy.dataCy("continue-review-po").click();
  cy.dataCy("vendor-approve-button").click();

  cy.dataCy("vendor-approve-po-modal-confirm-button").click();

  // The expectation of this function is that two
  // purchase orders have been set up, so this part of
  // the flow is to attempt to review the second
  cy.dataCy("purchase-order-review-card0").click();

  cy.dataCy("vendor-approve-button").click();

  cy.dataCy("vendor-approve-po-modal-confirm-button").click();
};

export const rejectPurchaseOrderAsVendor = (vendorEmail: string) => {
  // Visit the get secure link with email as the val
  cy.visit(`/get-secure-link-new?val=${vendorEmail}`);

  // Enter the static OTP as 000000
  // 2fa-input
  cy.dataCySelector("2fa-input", "input").type("000000");

  cy.dataCy("continue-review-po").click();
  cy.dataCy("vendor-reject-completely-button").click();

  cy.dataCy("rejection-reason").type("Cypress Rejection");
  cy.dataCy("vendor-reject-po-modal-confirm-button").click();

  // The expectation of this function is that two
  // purchase orders have been set up, so this part of
  // the flow is to attempt to review the second
  cy.dataCy("purchase-order-review-card0").click();

  cy.dataCy("vendor-reject-completely-button").click();

  cy.dataCy("rejection-reason").type("Second rejection");
  cy.dataCy("vendor-reject-po-modal-confirm-button").click();
};

export const requestChangesPurchaseOrderAsVendor = (vendorEmail: string) => {
  // Visit the get secure link with email as the val
  cy.visit(`/get-secure-link-new?val=${vendorEmail}`);

  // Enter the static OTP as 000000
  // 2fa-input
  cy.dataCySelector("2fa-input", "input").type("000000");

  cy.dataCy("continue-review-po").click();
  cy.dataCy("vendor-requests-changes-button").click();

  cy.dataCy("request-change-reason").type("Change this, please!");
  cy.dataCy("vendor-request-changes-po-modal-confirm-button").click();

  // The expectation of this function is that two
  // purchase orders have been set up, so this part of
  // the flow is to attempt to review the second
  cy.dataCy("purchase-order-review-card0").click();

  cy.dataCy("vendor-requests-changes-button").click();

  cy.dataCy("request-change-reason").type("Change this, as well.");
  cy.dataCy("vendor-request-changes-po-modal-confirm-button").click();
};
