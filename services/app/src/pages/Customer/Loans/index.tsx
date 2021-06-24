import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";
import { useContext } from "react";

export default function CustomerLoansPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Loans"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerLoansPageContent
            companyId={companyId}
            productType={productType}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
