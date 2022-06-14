import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { BankLoansTabLabel, BankLoansTabLabels } from "lib/enum";
import BankLoansActionRequiredTab from "pages/Bank/Loans/LoansActionRequiredTab";
import BankLoansAllTab from "pages/Bank/Loans/LoansAllTab";
import BankLoansMaturingSoonTab from "pages/Bank/Loans/LoansMaturingSoonTab";
import BankLoansPastDueTab from "pages/Bank/Loans/LoansPastDueTab";
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
  [key in BankLoansTabLabel]: JSX.Element;
} = {
  [BankLoansTabLabel.ActionRequired]: <BankLoansActionRequiredTab />,
  [BankLoansTabLabel.MaturingSoon]: <BankLoansMaturingSoonTab />,
  [BankLoansTabLabel.PastDue]: <BankLoansPastDueTab />,
  [BankLoansTabLabel.All]: <BankLoansAllTab />,
};

export default function BankLoansPage() {
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
            {BankLoansTabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          <SectionSpace />
          {LoanComponentMap[BankLoansTabLabels[selectedTabIndex]]}
        </Container>
      </PageContent>
    </Page>
  );
}
