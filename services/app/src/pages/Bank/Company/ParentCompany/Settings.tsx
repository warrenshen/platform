import BankParentCompanyPage from "pages/Bank/ParentCompanies/BankParentCompanyPage";
import BankParentCompanySettingsContent from "pages/Customer/ParentCompanySettings/BankParentCompanySettingsContent";

export default function BankParentCompaniesSettingsPage() {
  return (
    <BankParentCompanyPage>
      {({ parentCompanyId }) => (
        <BankParentCompanySettingsContent parentCompanyId={parentCompanyId} />
      )}
    </BankParentCompanyPage>
  );
}
