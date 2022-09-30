import {
  customerCreatesPurchaseOrderFlowNew,
  setupDataForTest,
} from "./../flows";

describe("Dispensary financing customer can", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
    });
  });

  it(
    "Save and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerCreatesPurchaseOrderFlowNew({
        purchaseOrderNumber: "C-0001",
        modalButtonDataCy: "create-purchase-order-modal-primary-button",
        expectedResultStatus: "Pending approval by vendor",
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
    "Save and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerCreatesPurchaseOrderFlowNew({
        purchaseOrderNumber: "C-0001",
        modalButtonDataCy: "create-purchase-order-modal-primary-button",
        expectedResultStatus: "Pending approval by vendor",
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
    "Save and submit non-Metrc purchase order",
    {
      retries: 5,
    },
    () => {
      customerCreatesPurchaseOrderFlowNew({
        purchaseOrderNumber: "C-0001",
        modalButtonDataCy: "create-purchase-order-modal-primary-button",
        expectedResultStatus: "Pending approval by vendor",
      });
    }
  );
});
