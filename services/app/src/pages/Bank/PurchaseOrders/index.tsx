import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import PurchaseOrdersActiveTab from "pages/Bank/PurchaseOrders/PurchaseOrdersActiveTab";
import PurchaseOrdersAllTab from "pages/Bank/PurchaseOrders/PurchaseOrdersAllTab";
import PurchaseOrdersClosedTab from "pages/Bank/PurchaseOrders/PurchaseOrdersClosedTab";
import { useState } from "react";

function BankPurchaseOrdersPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <PageContent title={"Purchase Orders"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Not Confirmed POs" />
            <Tab label="Confirmed POs" />
            <Tab label="All POs" />
          </Tabs>
          {selectedTabIndex === 0 ? (
            <PurchaseOrdersActiveTab />
          ) : selectedTabIndex === 1 ? (
            <PurchaseOrdersClosedTab />
          ) : (
            <PurchaseOrdersAllTab />
          )}
        </Box>
      </PageContent>
    </Page>
  );
}

export default BankPurchaseOrdersPage;
