import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";
import { useContext } from "react";

export default function CustomerAccountPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Account"}>
      {companyId && productType && (
        <CustomerLoansPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
