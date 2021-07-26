import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import BankAdvancesByPaymentDateTab from "pages/Bank/Advances/AdvancesByPaymentDateTab";
import BankAdvancesAllTab from "pages/Bank/Advances/AdvancesAllTab";
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
            <Tab label="All" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <BankAdvancesByPaymentDateTab />
          ) : (
            <BankAdvancesAllTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}
