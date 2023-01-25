import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  BankReportTabLabels,
  BankReportsTabLabel,
  BankReportsTabLabelType,
} from "lib/enum";
import BorrowersEndDatesTab from "pages/Bank/Reports/BorrowersEndDatesTab";
import BankReportFinancialsByCustomerTab from "pages/Bank/Reports/FinancialsByCustomerTab";
import BankReportFinancialsByDateTab from "pages/Bank/Reports/FinancialsByDateTab";
import BankReportFinancialsByLoanTab from "pages/Bank/Reports/FinancialsByLoanTab";
import BankReportPredictedFinancialsByCustomerTab from "pages/Bank/Reports/PredictedFinancialsByCustomerTab";
import BankReportTransactionsTab from "pages/Bank/Reports/TransactionsTab";
import { useState } from "react";

const BankReportsComponentMap: { [key in BankReportsTabLabel]: JSX.Element } = {
  [BankReportsTabLabel.FinancialsForCustomer]: (
    <BankReportFinancialsByCustomerTab />
  ),
  [BankReportsTabLabel.FinancialsForDate]: <BankReportFinancialsByDateTab />,
  [BankReportsTabLabel.FinancialsForLoan]: <BankReportFinancialsByLoanTab />,
  [BankReportsTabLabel.PredictedFinancialsForCustomer]: (
    <BankReportPredictedFinancialsByCustomerTab />
  ),
  [BankReportsTabLabel.Transactions]: <BankReportTransactionsTab />,
  [BankReportsTabLabel.BorrowersEndDates]: <BorrowersEndDatesTab />,
};

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
          {BankReportTabLabels.map((label: BankReportsTabLabelType) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        {BankReportsComponentMap[BankReportTabLabels[selectedTabIndex]]}
      </PageContent>
    </Page>
  );
}
