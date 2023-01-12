import BankParentCompanyPage from "pages/Bank/ParentCompanies/BankParentCompanyPage";
import BankParentCompanyUsersContent from "pages/Customer/ParentCompanyUsers/BankParentCompanyUsersContent";

export default function BankParentCompaniesUsersPage() {
  return (
    <BankParentCompanyPage>
      {({ companyId }) => (
        <BankParentCompanyUsersContent companyId={companyId} />
      )}
    </BankParentCompanyPage>
  );
}
