import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";
import { useContext } from "react";

function CustomerOverviewPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Overview"}>
      {companyId && productType && (
        <CustomerOverviewPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}

export default CustomerOverviewPage;
