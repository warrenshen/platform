import BankParentCompanyPage from "pages/Bank/ParentCompanies/BankParentCompanyPage";
import BankParentCompanyCompanyDetailsContent from "pages/Customer/ParentCompanyCompanyDetails/BankParentCompanyCompanyDetailsContent";

export default function BankParentCompaniesCompanyDetailsPage() {
  return (
    <BankParentCompanyPage>
      {({ companyId }) => (
        <BankParentCompanyCompanyDetailsContent companyId={companyId} />
      )}
    </BankParentCompanyPage>
  );
}
