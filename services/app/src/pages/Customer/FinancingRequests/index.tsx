import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import FinancingRequestsPageContent from "pages/Customer/FinancingRequests/FinancingRequestsPageContent";
import { useContext } from "react";

export default function CustomerFinancingRequestsPage() {
  const {
    user: { companyId, productType, isActiveContract },
  } = useContext(CurrentUserContext);
  return (
    <Page appBarTitle={"Financing Requests"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <FinancingRequestsPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={!!isActiveContract}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
