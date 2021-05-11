import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import PartnershipsActionRequiredTab from "pages/Bank/Partnerships/ActionRequiredTab";
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

function BankPartnershipsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Partnerships"}>
      <PageContent title={"Partnerships"}>
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
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 && <PartnershipsActionRequiredTab />}
        </Container>
      </PageContent>
    </Page>
  );
}

export default BankPartnershipsPage;
