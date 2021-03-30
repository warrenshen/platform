import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";
import { useContext } from "react";

function PurchaseOrdersPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <CustomerPurchaseOrdersPageContent companyId={companyId} />
    </Page>
  );
}

export default PurchaseOrdersPage;
