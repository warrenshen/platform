import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import BankParentCompaniesCompanyDetailsContent from "pages/Customer/ParentCompanyCompanyDetails/BankParentCompanyCompanyDetailsContent";
import { useContext } from "react";

export default function BankParentCompanyCompanyDetailsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Company Details"}>
      {companyId && (
        <BankParentCompaniesCompanyDetailsContent parentCompanyId={companyId} />
      )}
    </Page>
  );
}
