import { Companies, ProductTypeEnum } from "generated/graphql";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function BankCustomerPurchaseOrdersSubpage({
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
