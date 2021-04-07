import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import BankPaymentsActionRequiredTab from "pages/Bank/Payments/PaymentsActionRequiredTab";
import BankPaymentsAllTab from "pages/Bank/Payments/PaymentsAllTab";
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

function BankPaymentsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Payments"}>
      <PageContent title={"Payments"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Action Required" />
            <Tab label="All" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <BankPaymentsActionRequiredTab />
          ) : (
            <BankPaymentsAllTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}

export default BankPaymentsPage;
