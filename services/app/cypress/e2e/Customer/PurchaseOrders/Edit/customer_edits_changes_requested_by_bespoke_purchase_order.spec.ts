import {
  customerEditsPurchaseOrderFlow,
  setupDataForTest,
} from "@cypress/e2e/Customer/PurchaseOrders/flows";

describe("Dispensary financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
      purchaseOrderOldStatus: "changes_requested_by_bespoke",
    });
  });

  it(
    "Edit and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerEditsPurchaseOrderFlow({
        shouldSubmit: true,
      });
    }
  );
});

describe("Inventory financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "inventory_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
      purchaseOrderOldStatus: "changes_requested_by_bespoke",
    });
  });

  it(
    "Edit and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerEditsPurchaseOrderFlow({
        shouldSubmit: true,
      });
    }
  );
});

describe("Purchase money financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "purchase_money_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
      purchaseOrderOldStatus: "changes_requested_by_bespoke",
    });
  });

  it(
    "Edit and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerEditsPurchaseOrderFlow({
        shouldSubmit: true,
      });
    }
  );
});
