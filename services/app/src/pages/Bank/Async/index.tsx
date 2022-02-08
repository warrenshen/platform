import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import AsyncJobsTab from "pages/Bank/Async/AsyncJobsTab";
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

export default function AsyncPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Async"}>
      <PageContent title={"Async"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Async Pipelines" />
            <Tab label="Async Jobs" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? <AsyncJobsTab /> : <AsyncJobsTab />}
        </Container>
      </PageContent>
    </Page>
  );
}
