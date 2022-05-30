import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import BankAdvancesAllTab from "pages/Bank/Advances/AdvancesAllTab";
import BankAdvancesByPaymentDateTab from "pages/Bank/Advances/AdvancesByPaymentDateTab";
import BankAdvancesExportAchsTab from "pages/Bank/Advances/AdvancesExportAchsTab";
import BankAdvancesExportWiresTab from "pages/Bank/Advances/AdvancesExportWiresTab";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

const SectionSpace = styled.div`
  height: 24px;
`;

export default function BankAdvancesPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Advances"}>
      <PageContent title={"Advances"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="By Payment Date" />
            <Tab label="TP Export - ACHs" />
            <Tab label="TP Export - Wires" />
            <Tab label="All" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <BankAdvancesByPaymentDateTab />
          ) : selectedTabIndex === 1 ? (
            <BankAdvancesExportAchsTab />
          ) : selectedTabIndex === 2 ? (
            <BankAdvancesExportWiresTab />
          ) : (
            <BankAdvancesAllTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}
