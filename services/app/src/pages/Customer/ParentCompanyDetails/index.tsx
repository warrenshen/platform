import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import BankParentCompaniesDetailsContent from "pages/Customer/ParentCompanyDetails/BankParentCompanyDetailsContent";
import { useContext } from "react";

export default function BankParentCompanyDetailsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Details"}>
      {companyId && <BankParentCompaniesDetailsContent companyId={companyId} />}
    </Page>
  );
}
