import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { MetrcTabLabel, TabLabel, tabLabels } from "lib/enum";
import CannabisLicensesTab from "pages/Bank/Metrc/CannabisLicensesTab";
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

const MetrcComponentMap: { [key in MetrcTabLabel]: JSX.Element } = {
  [MetrcTabLabel.MetrcApiKeys]: <BankMetrcApiKeysTab />,
  [MetrcTabLabel.MetrcTransfers]: <BankMetrcTransfersTab />,
  [MetrcTabLabel.MetrcPackages]: <BankMetrcTransfersTab />,
  [MetrcTabLabel.CannabisLicenses]: <CannabisLicensesTab />,
};

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
            {tabLabels.map((label: TabLabel) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          <SectionSpace />
          {MetrcComponentMap[tabLabels[selectedTabIndex]]}
        </Container>
      </PageContent>
    </Page>
  );
}
