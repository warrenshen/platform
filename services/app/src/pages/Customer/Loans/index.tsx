import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";
import { useContext } from "react";

function CustomerLoansPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Loans"}>
      {companyId && productType && (
        <CustomerLoansPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}

export default CustomerLoansPage;
