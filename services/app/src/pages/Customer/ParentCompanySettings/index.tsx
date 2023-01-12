import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import BankParentCompaniesSettingsContent from "pages/Customer/ParentCompanySettings/BankParentCompanySettingsContent";
import { useContext } from "react";

export default function BankParentCompanySettingsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Settings"}>
      {companyId && (
        <BankParentCompaniesSettingsContent companyId={companyId} />
      )}
    </Page>
  );
}
