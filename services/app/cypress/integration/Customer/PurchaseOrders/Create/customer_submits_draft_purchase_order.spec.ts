import {
  customerSubmitsDraftPurchaseOrder,
  setupDataForTest,
} from "@cypress/integration/Customer/PurchaseOrders/flows";

describe("Dispensary financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
      setupPurchaseOrderToSubmitOrEdit: true,
    });
  });

  it(
    "Save and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerSubmitsDraftPurchaseOrder();
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
      customerSubmitsDraftPurchaseOrder();
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
      customerSubmitsDraftPurchaseOrder();
    }
  );
});
