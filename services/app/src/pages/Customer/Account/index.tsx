import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerAccountPageContent from "pages/Customer/Account/AccountPageContent";
import { useContext } from "react";

export default function CustomerAccountPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Account"}>
      {companyId && productType && (
        <CustomerAccountPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
