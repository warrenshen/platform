import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerPurchaseOrdersPageContentNew from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContentNew";
import { useContext } from "react";

function PurchaseOrdersPageNew() {
  const {
    user: { companyId, productType, isActiveContract },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      {companyId && productType && (
        <CustomerPurchaseOrdersPageContentNew
          companyId={companyId}
          productType={productType}
          isActiveContract={!!isActiveContract}
        />
      )}
    </Page>
  );
}

export default PurchaseOrdersPageNew;
