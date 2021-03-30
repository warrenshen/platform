import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";

interface Props {
  companyId: string;
}

function BankCustomerPurchaseOrdersSubpage({ companyId }: Props) {
  return <CustomerPurchaseOrdersPageContent companyId={companyId} />;
}

export default BankCustomerPurchaseOrdersSubpage;
