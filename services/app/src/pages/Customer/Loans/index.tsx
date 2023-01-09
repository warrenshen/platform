import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";
import { useContext } from "react";

export default function CustomerLoansPageNew() {
  const {
    user: { companyId, productType, isActiveContract },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Loans"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerLoansPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={!!isActiveContract}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
