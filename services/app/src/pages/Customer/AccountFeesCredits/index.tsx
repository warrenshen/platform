import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerAccountPageContent from "pages/Customer/AccountFeesCredits/AccountFeesCreditsPageContent";
import { useContext } from "react";

export default function CustomerAccountFeesCreditsPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Account Fees / Credits"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerAccountPageContent
            companyId={companyId}
            productType={productType}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
