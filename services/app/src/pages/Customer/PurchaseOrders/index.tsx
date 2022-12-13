import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContent";
import { useContext } from "react";

export default function PurchaseOrdersPageNew() {
  const {
    user: { companyId, productType, isActiveContract },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      {companyId && productType && (
        <CurrentCustomerProvider companyId={companyId}>
          <CustomerPurchaseOrdersPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={!!isActiveContract}
          />
        </CurrentCustomerProvider>
      )}
    </Page>
  );
}
