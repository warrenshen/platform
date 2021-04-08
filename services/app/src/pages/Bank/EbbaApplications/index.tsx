import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import EbbaApplicationsActiveTab from "pages/Bank/EbbaApplications/EbbaApplicationsActiveTab";
import EbbaApplicationsClosedTab from "pages/Bank/EbbaApplications/EbbaApplicationsClosedTab";
import { useState } from "react";

function BankEbbaApplicationsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Borrowing Bases"}>
      <PageContent title={"Borrowing Bases"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Action Required" />
            <Tab label="Confirmed" />
          </Tabs>
          {selectedTabIndex === 0 ? (
            <EbbaApplicationsActiveTab />
          ) : (
            <EbbaApplicationsClosedTab />
          )}
        </Box>
      </PageContent>
    </Page>
  );
}

export default BankEbbaApplicationsPage;
