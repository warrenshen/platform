import { ProductTypeEnum } from "generated/graphql";

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
