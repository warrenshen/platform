import CustomerPageContentPurchaseOrders from "components/CustomerPageContent/PurchaseOrders";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext } from "react";

function PurchaseOrdersPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <CustomerPageContentPurchaseOrders companyId={companyId} />
    </Page>
  );
}

export default PurchaseOrdersPage;
