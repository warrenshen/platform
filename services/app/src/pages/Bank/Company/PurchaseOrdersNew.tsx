import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContentNew";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean;
}

export default function BankCustomerPurchaseOrdersSubpageNew({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return (
    !!productType && (
      <CustomerPurchaseOrdersPageContent
        companyId={companyId}
        productType={productType}
        isActiveContract={isActiveContract}
      />
    )
  );
}
