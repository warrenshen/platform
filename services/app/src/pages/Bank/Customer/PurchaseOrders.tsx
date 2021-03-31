import { Companies, ProductTypeEnum } from "generated/graphql";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

function BankCustomerPurchaseOrdersSubpage({ companyId, productType }: Props) {
  return (
    <CustomerPurchaseOrdersPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}

export default BankCustomerPurchaseOrdersSubpage;
