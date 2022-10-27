import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerReportsPageContent from "pages/Customer/Reports/ReportsPageContent";

export default function BankCompanyCustomerReportsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerReportsPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </BankCompanyPage>
  );
}
