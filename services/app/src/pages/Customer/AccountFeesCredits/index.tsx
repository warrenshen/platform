import Page from "components/Shared/Page";
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
        <CustomerAccountPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
