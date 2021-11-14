import { ProductTypeEnum } from "lib/enum";

function isProductTypeNone(productType: ProductTypeEnum | null) {
  return productType === ProductTypeEnum.None || productType === null;
}

export function isVendorsTabVisible(productType: ProductTypeEnum | null) {
  // Vendors tab is visible if either
  // 1. Product type is None OR
  // 2. Product type is not Invoice Financing
  return (
    isProductTypeNone(productType) ||
    (!!productType &&
      [
        ProductTypeEnum.InventoryFinancing,
        ProductTypeEnum.LineOfCredit,
        ProductTypeEnum.PurchaseMoneyFinancing,
      ].includes(productType))
  );
}

export function isPayorsTabVisible(productType: ProductTypeEnum | null) {
  // Vendors tab is visible if either
  // 1. Product type is None OR
  // 2. Product type is Invoice Financing or Purchase Money Financing
  return (
    isProductTypeNone(productType) ||
    (!!productType &&
      [
        ProductTypeEnum.InvoiceFinancing,
        ProductTypeEnum.PurchaseMoneyFinancing,
      ].includes(productType))
  );
}

export function isInventoryFinancingProductType(
  productType: ProductTypeEnum | null
) {
  return productType === ProductTypeEnum.InventoryFinancing;
}

export function isLineOfCreditProductType(productType: ProductTypeEnum | null) {
  return productType === ProductTypeEnum.LineOfCredit;
}

export function isInvoiceFinancingProductType(
  productType: ProductTypeEnum | null
) {
  return productType === ProductTypeEnum.InvoiceFinancing;
}

export function isPurchaseMoneyFinancingProductType(
  productType: ProductTypeEnum | null
) {
  return productType === ProductTypeEnum.PurchaseMoneyFinancing;
}
export class SettingsHelper {
  _productType: ProductTypeEnum;

  constructor(producType: ProductTypeEnum) {
    this._productType = producType;
  }

  shouldShowVendorOnboardingLink(): boolean {
    return this._productType === ProductTypeEnum.LineOfCredit;
  }

  shouldShowVendorAgreement(): boolean {
    return (
      this._productType === ProductTypeEnum.InventoryFinancing ||
      this._productType === ProductTypeEnum.PurchaseMoneyFinancing
    );
  }

  shouldShowNoticeOfAssignment(): boolean {
    return (
      this._productType === ProductTypeEnum.InvoiceFinancing ||
      this._productType === ProductTypeEnum.PurchaseMoneyFinancing
    );
  }
}
