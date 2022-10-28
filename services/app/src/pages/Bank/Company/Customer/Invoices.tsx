import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerInvoicesPageContent from "pages/Customer/Invoices/InvoicesPageContent";

export default function BankCompanyCustomerInvoicesPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerInvoicesPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </BankCompanyPage>
  );
}
