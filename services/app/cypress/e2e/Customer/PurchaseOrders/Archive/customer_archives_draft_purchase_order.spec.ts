import {
  customerArchivesPurchaseOrderFlow,
  setupDataForTest,
} from "@cypress/e2e/Customer/PurchaseOrders/flows";

describe("Dispensary financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
    });
  });

  it(
    "Archive purchase order",
    {
      retries: 5,
    },
    () => {
      customerArchivesPurchaseOrderFlow({
        datagrid: "not-ready-to-request-financing-data-grid",
      });
    }
  );
});

describe("Inventory financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "inventory_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
    });
  });

  it(
    "Save and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerArchivesPurchaseOrderFlow({
        datagrid: "not-ready-to-request-financing-data-grid",
      });
    }
  );
});

describe("Purchase money financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "purchase_money_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
    });
  });

  it(
    "Save and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerArchivesPurchaseOrderFlow({
        datagrid: "not-ready-to-request-financing-data-grid",
      });
    }
  );
});
