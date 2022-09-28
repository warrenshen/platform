import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";
import { useContext } from "react";

function PurchaseOrdersPage() {
  const {
    user: { companyId, productType, isActiveContract },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      {companyId && productType && (
        <CustomerPurchaseOrdersPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={!!isActiveContract}
        />
      )}
    </Page>
  );
}

export default PurchaseOrdersPage;
