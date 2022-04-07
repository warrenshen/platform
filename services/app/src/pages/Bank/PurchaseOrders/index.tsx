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
import PurchaseOrdersDraftTab from "pages/Bank/PurchaseOrders/PurchaseOrdersDraftTab";
import { useState } from "react";
import PurchaseOrdersIncompleteTab from "./PurchaseOrdersIncompleteTab";

const PurchaseOrderComponentMap: {
  [key in BankPurchaseOrdersTabLabel]: JSX.Element;
} = {
  [BankPurchaseOrdersTabLabel.NotConfirmedPOs]: <PurchaseOrdersActiveTab />,
  [BankPurchaseOrdersTabLabel.ConfirmedPOs]: <PurchaseOrdersClosedTab />,
  [BankPurchaseOrdersTabLabel.IncompletePOs]: <PurchaseOrdersIncompleteTab />,
  [BankPurchaseOrdersTabLabel.AllPOs]: <PurchaseOrdersAllTab />,
  [BankPurchaseOrdersTabLabel.DraftedPOs]: <PurchaseOrdersDraftTab />,
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
              <Tab
                // Replace space with underscore and change to lower case
                // eg:- Not Confirmed Pos to not-confirmed-pos
                data-cy={label.replace(/\s+/g, "-").toLowerCase()}
                key={label}
                label={label}
              />
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
