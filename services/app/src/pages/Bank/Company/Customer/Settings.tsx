import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerSettingsPageContent from "pages/Bank/Company/Settings";

export default function BankCompanyCustomerSettingsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerSettingsPageContent companyId={companyId} />
      )}
    </BankCompanyPage>
  );
}
