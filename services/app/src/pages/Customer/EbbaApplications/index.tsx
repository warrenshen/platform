import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerEbbaApplicationsPageContent from "pages/Customer/EbbaApplications/EbbaApplicationsPageContent";
import { useContext } from "react";

export default function CustomerEbbaApplicationsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Borrowing Base"}>
      <CustomerEbbaApplicationsPageContent companyId={companyId} />
    </Page>
  );
}
