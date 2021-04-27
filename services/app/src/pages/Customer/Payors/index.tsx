import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerPayorsPageContent from "pages/Customer/Payors/PayorsPageContent";
import { useContext } from "react";

export default function CustomerPayorsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle="Payors">
      {companyId && <CustomerPayorsPageContent companyId={companyId} />}
    </Page>
  );
}
