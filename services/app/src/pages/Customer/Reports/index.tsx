import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerReportsPageContent from "pages/Customer/Reports/ReportsPageContent";
import { useContext } from "react";

export default function CustomerReportsPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Reports"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerReportsPageContent
            companyId={companyId}
            productType={productType}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
