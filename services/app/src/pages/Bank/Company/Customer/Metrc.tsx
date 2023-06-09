import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerMetrcPageContent from "pages/Bank/Company/Metrc";

export default function BankCompanyCustomerMetrcPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerMetrcPageContent companyId={companyId} />
      )}
    </BankCompanyPage>
  );
}
