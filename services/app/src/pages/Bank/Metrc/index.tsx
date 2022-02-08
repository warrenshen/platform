import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import BankMetrcApiKeysTab from "pages/Bank/Metrc/MetrcApiKeysTab";
import BankMetrcTransfersTab from "pages/Bank/Metrc/MetrcTransfersTab";
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

export default function BankMetrcPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Metrc"}>
      <PageContent title={"Metrc"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Metrc Api Keys" />
            <Tab label="Metrc Transfers" />
            <Tab label="Metrc Packages" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <BankMetrcApiKeysTab />
          ) : selectedTabIndex === 1 ? (
            <BankMetrcTransfersTab />
          ) : (
            <BankMetrcTransfersTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}
