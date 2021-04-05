import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
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

function BankLoansPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Loans"}>
      <Container>
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
        >
          <Tab label="Action Required" />
          <Tab label="Maturing Soon" />
          <Tab label="Past Due" />
          <Tab label="All" />
        </Tabs>
        <SectionSpace />
        {selectedTabIndex === 0 ? (
          <BankLoansActionRequiredTab />
        ) : selectedTabIndex === 1 ? (
          <BankLoansMaturingSoonTab />
        ) : selectedTabIndex === 2 ? (
          <BankLoansPastDueTab />
        ) : (
          <BankLoansAllTab />
        )}
      </Container>
    </Page>
  );
}

export default BankLoansPage;
