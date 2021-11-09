import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import InvoicesActiveTab from "pages/Bank/Invoices/InvoicesActiveTab";
import InvoicesAllTab from "pages/Bank/Invoices/InvoicesAllTab";
import InvoicesClosedTab from "pages/Bank/Invoices/InvoicesClosedTab";
import { useState } from "react";

export default function BankInvoicesPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle="Invoices">
      <PageContent title={"Invoices"}>
        <Box display="flex" flexDirection="column">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Not Confirmed Invoices" />
            <Tab label="Confirmed Invoices" />
            <Tab label="All Invoices" />
          </Tabs>
          {selectedTabIndex === 0 ? (
            <InvoicesActiveTab />
          ) : selectedTabIndex === 1 ? (
            <InvoicesClosedTab />
          ) : (
            <InvoicesAllTab />
          )}
        </Box>
      </PageContent>
    </Page>
  );
}
