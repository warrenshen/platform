import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import PartnershipsActionRequiredTab from "pages/Bank/Partnerships/ActionRequiredTab";
import PartnershipsClosedTab from "pages/Bank/Partnerships/ClosedTab";
import ContactChangeTab from "pages/Bank/Partnerships/ContactChangeTab";
import InvitedTab from "pages/Bank/Partnerships/InvitedTab";
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
    <Page appBarTitle={"Partnership Requests"}>
      <PageContent title={"Partnership Requests"}>
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
            <Tab label="Closed Requests" />
            <Tab label="Pending Vendor Invites" />
            <Tab label="Pending Contact Changes" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <PartnershipsActionRequiredTab />
          ) : selectedTabIndex === 1 ? (
            <PartnershipsClosedTab />
          ) : selectedTabIndex === 2 ? (
            <InvitedTab />
          ) : (
            <ContactChangeTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}

export default BankPartnershipsPage;
