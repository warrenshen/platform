import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  BankPurchaseOrdersTabLabel,
  BankPurchaseOrdersTabLabels,
} from "lib/enum";
import PurchaseOrdersActiveTab from "pages/Bank/PurchaseOrders/PurchaseOrdersActiveTab";
import PurchaseOrdersAllTab from "pages/Bank/PurchaseOrders/PurchaseOrdersAllTab";
import PurchaseOrdersClosedTab from "pages/Bank/PurchaseOrders/PurchaseOrdersClosedTab";
import { useState } from "react";
import PurchaseOrdersIncompleteTab from "./PurchaseOrdersIncompleteTab";

const PurchaseOrderComponentMap: {
  [key in BankPurchaseOrdersTabLabel]: JSX.Element;
} = {
  [BankPurchaseOrdersTabLabel.NotConfirmedPOs]: <PurchaseOrdersActiveTab />,
  [BankPurchaseOrdersTabLabel.ConfirmedPOs]: <PurchaseOrdersClosedTab />,
  [BankPurchaseOrdersTabLabel.IncompletePOs]: <PurchaseOrdersIncompleteTab />,
  [BankPurchaseOrdersTabLabel.AllPOs]: <PurchaseOrdersAllTab />,
};

export default function BankPurchaseOrdersPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <PageContent title={"Purchase Orders"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_: any, value: number) => setSelectedTabIndex(value)}
          >
            {BankPurchaseOrdersTabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          {
            PurchaseOrderComponentMap[
              BankPurchaseOrdersTabLabels[selectedTabIndex]
            ]
          }
        </Box>
      </PageContent>
    </Page>
  );
}
