import {
  customerCreatesPurchaseOrderFlowNew,
  setupDataForTest,
} from "@cypress/integration/Customer/PurchaseOrders/flows";

describe("Dispensary financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
    });
  });

  it(
    "Save non-Metrc purchase order as draft",
    {
      retries: 5,
    },
    () => {
      customerCreatesPurchaseOrderFlowNew({
        purchaseOrderNumber: "C-0001",
        modalButtonDataCy: "create-purchase-order-modal-secondary-button",
        expectedResultStatus: "Draft",
      });
    }
  );
});

describe("Inventory financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "inventory_financing",
    });
  });

  it(
    "Save non-Metrc purchase order as draft",
    {
      retries: 5,
    },
    () => {
      customerCreatesPurchaseOrderFlowNew({
        purchaseOrderNumber: "C-0001",
        modalButtonDataCy: "create-purchase-order-modal-secondary-button",
        expectedResultStatus: "Draft",
      });
    }
  );
});

describe("Purchase money financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "purchase_money_financing",
    });
  });

  it(
    "Save non-Metrc purchase order as draft",
    {
      retries: 5,
    },
    () => {
      customerCreatesPurchaseOrderFlowNew({
        purchaseOrderNumber: "C-0001",
        modalButtonDataCy: "create-purchase-order-modal-secondary-button",
        expectedResultStatus: "Draft",
      });
    }
  );
});
