import { rejectPurchaseOrderAsVendor, setupDataForTest } from "./../flows";

describe("Vendor rejection", () => {
  before(() => {
    setupDataForTest({
      productType: "dispensary_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can reject a purchase order for a dispensary financing client",
    {
      retries: 5,
    },
    () => {
      rejectPurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});

describe("Vendor rejection", () => {
  before(() => {
    setupDataForTest({
      productType: "inventory_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can reject a purchase order for a inventory financing client",
    {
      retries: 5,
    },
    () => {
      rejectPurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});

describe("Vendor rejection", () => {
  before(() => {
    setupDataForTest({
      productType: "purchase_money_financing",
      setupPurchaseOrder: true,
      shouldLogin: false,
    });
  });

  it(
    "Vendor can reject a purchase order for a purchase money financing client",
    {
      retries: 5,
    },
    () => {
      rejectPurchaseOrderAsVendor("vendor@bespokefinancial.com");
    }
  );
});
