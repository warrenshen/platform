import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";

export default function BankCompanyCustomerPurchaseOrderPage() {
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
