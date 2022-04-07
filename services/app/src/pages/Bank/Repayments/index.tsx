import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import BankRepaymentsActionRequiredTab from "pages/Bank/Repayments/RepaymentsActionRequiredTab";
import BankRepaymentsByDepositDateTab from "pages/Bank/Repayments/RepaymentsByDepositDateTab";
import BankRepaymentsAllTab from "pages/Bank/Repayments/RepaymentsAllTab";
import { useState } from "react";
import styled from "styled-components";
import { BankRepaymentsTabLabel, BankRepaymentsTabLabels } from "lib/enum";
import BankRepaymentsExportAchsTab from "pages/Bank/Repayments/RepaymentsExportAchsTab";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

const SectionSpace = styled.div`
  height: 24px;
`;

const BankRepaymentComponentMap: {
  [key in BankRepaymentsTabLabel]: JSX.Element;
} = {
  [BankRepaymentsTabLabel.ActionRequired]: <BankRepaymentsActionRequiredTab />,
  [BankRepaymentsTabLabel.ByDepositDate]: <BankRepaymentsByDepositDateTab />,
  [BankRepaymentsTabLabel.TpExportACHS]: <BankRepaymentsExportAchsTab />,
  [BankRepaymentsTabLabel.All]: <BankRepaymentsAllTab />,
};

export default function BankRepaymentsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Repayments"}>
      <PageContent title={"Repayments"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            {BankRepaymentsTabLabels.map((label) => (
              <Tab label={label} />
            ))}
          </Tabs>
          <SectionSpace />
          {BankRepaymentComponentMap[BankRepaymentsTabLabels[selectedTabIndex]]}
        </Container>
      </PageContent>
    </Page>
  );
}
