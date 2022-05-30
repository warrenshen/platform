import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import BankReportFinancialsByCustomerTab from "pages/Bank/Reports/FinancialsByCustomerTab";
import BankReportFinancialsByDateTab from "pages/Bank/Reports/FinancialsByDateTab";
import BankReportFinancialsByLoanTab from "pages/Bank/Reports/FinancialsByLoanTab";
import BankReportTransactionsTab from "pages/Bank/Reports/TransactionsTab";
import { useState } from "react";

export default function BankReportsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Reports"}>
      <PageContent title={"Reports"}>
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
        >
          <Tab label="Financials - For Customer" />
          <Tab label="Financials - For Date" />
          <Tab label="Financials - For Loan" />
          <Tab label="Transactions" />
        </Tabs>
        {selectedTabIndex === 0 ? (
          <BankReportFinancialsByCustomerTab />
        ) : selectedTabIndex === 1 ? (
          <BankReportFinancialsByDateTab />
        ) : selectedTabIndex === 2 ? (
          <BankReportFinancialsByLoanTab />
        ) : (
          <BankReportTransactionsTab />
        )}
      </PageContent>
    </Page>
  );
}
