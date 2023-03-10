import BankParentCompanyPage from "pages/Bank/ParentCompanies/BankParentCompanyPage";
import BankParentCompanyUsersContent from "pages/Customer/ParentCompanyUsers/BankParentCompanyUsersContent";

export default function BankParentCompaniesUsersPage() {
  return (
    <BankParentCompanyPage>
      {({ parentCompanyId }) => (
        <BankParentCompanyUsersContent parentCompanyId={parentCompanyId} />
      )}
    </BankParentCompanyPage>
  );
}
