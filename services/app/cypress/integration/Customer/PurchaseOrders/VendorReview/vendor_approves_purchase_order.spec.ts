import {
  approvePurchaseOrderAsVendor,
  setupDataForTest,
} from "@cypress/integration/Customer/PurchaseOrders/flows";

describe("Vendor approval", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can approve a purchase order for a dispensary financing client",
    {
      retries: 5,
    },
    () => {
      approvePurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});

describe("Vendor approval", () => {
  before(() => {
    setupDataForTest({
      productType: "inventory_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can approve a purchase order for a inventory financing client",
    {
      retries: 5,
    },
    () => {
      approvePurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});

describe("Vendor approval", () => {
  before(() => {
    setupDataForTest({
      productType: "purchase_money_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can approve a purchase order for a purchase money financing client",
    {
      retries: 5,
    },
    () => {
      approvePurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});
