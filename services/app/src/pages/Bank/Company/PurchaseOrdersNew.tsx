import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContentNew";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function BankCustomerPurchaseOrdersSubpageNew({
  companyId,
  productType,
}: Props) {
  return (
    !!productType && (
      <CustomerPurchaseOrdersPageContent
        companyId={companyId}
        productType={productType}
      />
    )
  );
}
