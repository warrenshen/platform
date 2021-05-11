import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
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
        </Tabs>
        {selectedTabIndex === 0 ? <BankTransfersTab /> : null}
      </PageContent>
    </Page>
  );
}
