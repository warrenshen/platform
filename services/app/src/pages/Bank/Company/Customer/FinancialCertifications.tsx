import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerFinancialCertificationsPageContent from "pages/Customer/FinancialCertifications/FinancialCertificationsPageContent";

export default function BankCompanyCustomerFinancialCertificationsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerFinancialCertificationsPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
