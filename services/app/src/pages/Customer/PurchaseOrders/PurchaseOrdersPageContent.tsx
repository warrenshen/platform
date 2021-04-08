import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies, ProductTypeEnum } from "generated/graphql";
import CustomerPurchaseOrdersClosedTab from "pages/Customer/PurchaseOrders/PurchaseOrdersClosedTab";
import CustomerPurchaseOrdersOpenTab from "pages/Customer/PurchaseOrders/PurchaseOrdersOpenTab";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

function CustomerPurchaseOrdersPageContent({ companyId, productType }: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent
      title={"Purchase Orders"}
      subtitle={
        "Submit a new PO, edit an existing PO, or request financing for approved POs."
      }
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active POs" />
        <Tab label="Closed POs" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerPurchaseOrdersOpenTab
          companyId={companyId}
          productType={productType}
        />
      ) : (
        <CustomerPurchaseOrdersClosedTab companyId={companyId} />
      )}
    </PageContent>
  );
}

export default CustomerPurchaseOrdersPageContent;
