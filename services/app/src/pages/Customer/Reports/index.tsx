import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerReportsPageContent from "pages/Customer/Reports/ReportsPageContent";
import { useContext } from "react";

export default function CustomerLoansPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Reports"}>
      {companyId && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerReportsPageContent companyId={companyId} />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
