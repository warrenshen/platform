import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import EbbaApplicationsBorrowingBaseTab from "pages/Bank/ClientSurveillance/EbbaApplicationsBorrowingBaseTab";
import EbbaApplicationsFinancialReportsTab from "pages/Bank/ClientSurveillance/EbbaApplicationsFinancialReportsTab";
import EbbaApplicationsClosedTab from "pages/Bank/ClientSurveillance/EbbaApplicationsClosedTab";
import { useState } from "react";

export default function BankEbbaApplicationsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Client Surveillance"}>
      <PageContent title={"Client Surveillance"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="PO / INV - Financial Reports" />
            <Tab label="LOC - Borrowing Bases" />
            <Tab label="Historical Certifications" />
          </Tabs>
          {selectedTabIndex === 0 ? (
            <EbbaApplicationsFinancialReportsTab />
          ) : selectedTabIndex === 1 ? (
            <EbbaApplicationsBorrowingBaseTab />
          ) : (
            <EbbaApplicationsClosedTab />
          )}
        </Box>
      </PageContent>
    </Page>
  );
}
