import CustomerPageContentPurchaseOrders from "components/CustomerPageContent/PurchaseOrders";

interface Props {
  companyId: string;
}

function BankCustomerPurchaseOrdersSubpage({ companyId }: Props) {
  return <CustomerPageContentPurchaseOrders companyId={companyId} />;
}

export default BankCustomerPurchaseOrdersSubpage;
