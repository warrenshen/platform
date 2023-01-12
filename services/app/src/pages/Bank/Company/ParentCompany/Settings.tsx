import BankParentCompanyPage from "pages/Bank/ParentCompanies/BankParentCompanyPage";
import BankParentCompanySettingsContent from "pages/Customer/ParentCompanySettings/BankParentCompanySettingsContent";

export default function BankParentCompaniesSettingsPage() {
  return (
    <BankParentCompanyPage>
      {({ companyId }) => (
        <BankParentCompanySettingsContent companyId={companyId} />
      )}
    </BankParentCompanyPage>
  );
}
