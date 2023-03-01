import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  BankPurchaseOrdersTabLabelNew,
  BankPurchaseOrdersTabLabelsNew,
} from "lib/enum";
import { getDataCyForTabLabel } from "lib/utils/utils";
import PurchaseOrdersAllTab from "pages/Bank/PurchaseOrders/PurchaseOrdersAllTab";
import PurchaseOrdersArchivedTab from "pages/Bank/PurchaseOrders/PurchaseOrdersArchivedTab";
import PurchaseOrdersNotReadyForFinancingTab from "pages/Bank/PurchaseOrders/PurchaseOrdersNotReadyForFinancingTab";
import PurchaseOrdersReadyForFinancingTab from "pages/Bank/PurchaseOrders/PurchaseOrdersReadyForFinancingTab";
import { useState } from "react";

const PurchaseOrderComponentMap: {
  [key in BankPurchaseOrdersTabLabelNew]: JSX.Element;
} = {
  [BankPurchaseOrdersTabLabelNew.ReadyForFinancing]: (
    <PurchaseOrdersReadyForFinancingTab />
  ),
  [BankPurchaseOrdersTabLabelNew.NotReadyForFinancing]: (
    <PurchaseOrdersNotReadyForFinancingTab />
  ),
  [BankPurchaseOrdersTabLabelNew.Archived]: <PurchaseOrdersArchivedTab />,
  [BankPurchaseOrdersTabLabelNew.All]: <PurchaseOrdersAllTab />,
};

export default function BankPurchaseOrdersPageNew() {
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
            {BankPurchaseOrdersTabLabelsNew.map((label) => (
              <Tab
                // Replace space with underscore and change to lower case
                // eg:- Not Confirmed Pos to not-confirmed-pos
                data-cy={`${getDataCyForTabLabel(label)}-tab`}
                key={label}
                label={label}
              />
            ))}
          </Tabs>
          {
            PurchaseOrderComponentMap[
              BankPurchaseOrdersTabLabelsNew[selectedTabIndex]
            ]
          }
        </Box>
      </PageContent>
    </Page>
  );
}
