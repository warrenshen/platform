import {
  Box,
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  Theme,
} from "@material-ui/core";
import Page from "components/Shared/Page";
import PurchaseOrdersActiveTab from "pages/Bank/PurchaseOrders/PurchaseOrdersActiveTab";
import PurchaseOrdersAllTab from "pages/Bank/PurchaseOrders/PurchaseOrdersAllTab";
import PurchaseOrdersClosedTab from "pages/Bank/PurchaseOrders/PurchaseOrdersClosedTab";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
  })
);

function BankPurchaseOrdersPage() {
  const classes = useStyles();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
        >
          <Tab label="Not Confirmed POs" />
          <Tab label="Confirmed Pos" />
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
    </Page>
  );
}

export default BankPurchaseOrdersPage;
