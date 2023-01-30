import {
  requestChangesPurchaseOrderAsVendor,
  setupDataForTest,
} from "@cypress/e2e/Customer/PurchaseOrders/flows";

describe("Vendor requests changes", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can reqeust changes on a purchase order for a dispensary financing client",
    {
      retries: 5,
    },
    () => {
      requestChangesPurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});

describe("Vendor requests changes", () => {
  before(() => {
    setupDataForTest({
      productType: "inventory_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can reqeust changes on a purchase order for a inventory financing client",
    {
      retries: 5,
    },
    () => {
      requestChangesPurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});

describe("Vendor requests changes", () => {
  before(() => {
    setupDataForTest({
      productType: "purchase_money_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can reqeust changes on a purchase order for a purchase money financing client",
    {
      retries: 5,
    },
    () => {
      requestChangesPurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});
