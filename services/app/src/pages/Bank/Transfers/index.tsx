import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import SyncWithPlatformTab from "pages/Bank/Transfers/SyncWithPlatformTab";
import BankTransfersTab from "pages/Bank/Transfers/TransfersTab";
import { useState } from "react";

export default function BankReportsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Metrc"}>
      <PageContent title={"Metrc"}>
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
        >
          <Tab label="Transfers" />
          <Tab label="Sync with Platform" />
        </Tabs>
        {selectedTabIndex === 0 ? (
          <BankTransfersTab />
        ) : selectedTabIndex === 1 ? (
          <SyncWithPlatformTab />
        ) : null}
      </PageContent>
    </Page>
  );
}
