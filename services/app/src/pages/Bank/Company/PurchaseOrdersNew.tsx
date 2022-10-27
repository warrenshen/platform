import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContentNew";

export default function BankCustomerPurchaseOrdersPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerPurchaseOrdersPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
