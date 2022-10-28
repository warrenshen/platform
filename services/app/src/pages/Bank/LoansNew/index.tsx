import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { BankLoansTabLabelNew, BankLoansTabLabelsNew } from "lib/enum";
import BankLoansActiveTab from "pages/Bank/LoansNew/LoansActiveTab";
import BankLoansAllTab from "pages/Bank/LoansNew/LoansAllTab";
import BankLoansClosedTab from "pages/Bank/LoansNew/LoansClosedTab";
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

const LoanComponentMap: {
  [key in BankLoansTabLabelNew]: JSX.Element;
} = {
  [BankLoansTabLabelNew.Active]: <BankLoansActiveTab />,
  [BankLoansTabLabelNew.Closed]: <BankLoansClosedTab />,
  [BankLoansTabLabelNew.All]: <BankLoansAllTab />,
};

export default function BankLoansPageNew() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Loans"}>
      <PageContent title={"Loans"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            {BankLoansTabLabelsNew.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          <SectionSpace />
          {LoanComponentMap[BankLoansTabLabelsNew[selectedTabIndex]]}
        </Container>
      </PageContent>
    </Page>
  );
}
