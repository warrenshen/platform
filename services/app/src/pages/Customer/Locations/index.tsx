import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerLocationsPageContent from "pages/Customer/Locations/LocationsPageContent";
import { useContext } from "react";

export default function CustomerLoansPage() {
  const {
    user: { parentCompanyId, companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page isLocationsPage={true} appBarTitle={"Loans"}>
      <CurrentCustomerProvider companyId={companyId}>
        {parentCompanyId && (
          <CustomerLocationsPageContent parentCompanyId={parentCompanyId} />
        )}
      </CurrentCustomerProvider>
    </Page>
  );
}
