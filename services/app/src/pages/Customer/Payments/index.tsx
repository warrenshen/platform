import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerPaymentsPageContent from "pages/Customer/Payments/PaymentsPageContent";
import { useContext } from "react";

function CustomerPaymentsPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Payments"}>
      {companyId && productType && (
        <CustomerPaymentsPageContent companyId={companyId} />
      )}
    </Page>
  );
}

export default CustomerPaymentsPage;
