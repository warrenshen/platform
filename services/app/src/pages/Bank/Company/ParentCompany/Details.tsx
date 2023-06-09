import BankParentCompanyPage from "pages/Bank/ParentCompanies/BankParentCompanyPage";
import BankParentCompanyDetailsContent from "pages/Customer/ParentCompanyDetails/BankParentCompanyDetailsContent";

export default function BankParentCompaniesDetailsPage() {
  return (
    <BankParentCompanyPage>
      {({ parentCompanyId }) => (
        <BankParentCompanyDetailsContent parentCompanyId={parentCompanyId} />
      )}
    </BankParentCompanyPage>
  );
}
