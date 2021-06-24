import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";
import { useContext } from "react";

export default function CustomerOverviewPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Overview"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerOverviewPageContent
            companyId={companyId}
            productType={productType}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
