import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import BankParentCompaniesUsersContent from "pages/Customer/ParentCompanyUsers/BankParentCompanyUsersContent";
import { useContext } from "react";

export default function BankParentCompanyUsersPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Users"}>
      {companyId && <BankParentCompaniesUsersContent companyId={companyId} />}
    </Page>
  );
}
