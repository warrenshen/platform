import { Box, Tab, Tabs } from "@material-ui/core";
import RunFinancialStatementsAlertModal from "components/EbbaApplication/RunFinancialStatementsAlertModal";
import CreateBulkMinimumMonthlyFeeModal from "components/Fee/CreateMinimumInterestFeesModal";
import CreateMonthEndPaymentsModal from "components/Fee/CreateMonthEndPaymentsModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import KickoffMonthlySummaryEmailsModal from "components/Reports/KickoffMonthlySummaryEmailsModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { Action } from "lib/auth/rbac-rules";
import { CompaniesTabLabel, CompaniesTabLabels } from "lib/enum";
import CompaniesCompaniesTab from "pages/Bank/CompaniesNew/CompaniesCompaniesTab";
import CompaniesCustomersTab from "pages/Bank/CompaniesNew/CompaniesCustomersTab";
import { useState } from "react";

const CompaniesComponentMap: {
  [key in CompaniesTabLabel]: JSX.Element;
} = {
  [CompaniesTabLabel.Customers]: <CompaniesCustomersTab />,
  [CompaniesTabLabel.Companies]: <CompaniesCompaniesTab />,
};

export default function BankCompaniesNewPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Companies"}>
      <PageContent
        title={"Companies"}
        bankActions={
          <>
            <Can perform={Action.RunFinancialAlert}>
              <Box mr={2}>
                <ModalButton
                  label={"Run Financial Statements Alert"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <RunFinancialStatementsAlertModal
                      handleClose={() => {
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.KickoffMonthlySummaryEmails}>
              <Box mr={2}>
                <ModalButton
                  label={"Kickoff Monthly Summary Emails"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <KickoffMonthlySummaryEmailsModal
                      handleClose={() => {
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.BookFees}>
              <Box mr={2}>
                <ModalButton
                  label={"Create Month-End Repayments"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <CreateMonthEndPaymentsModal
                      handleClose={() => {
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.BookFees}>
              <Box mr={2}>
                <ModalButton
                  label={"Book Minimum Interest Fees"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <CreateBulkMinimumMonthlyFeeModal
                      handleClose={() => {
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.RunBalances}>
              <Box mr={2}>
                <ModalButton
                  label={"Run Balances (All Customers)"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <RunCustomerBalancesModal
                      handleClose={() => {
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          </>
        }
      >
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label={`${CompaniesTabLabel.Customers}`} />
            <Tab label={`${CompaniesTabLabel.Companies}`} />
          </Tabs>
          {CompaniesComponentMap[CompaniesTabLabels[selectedTabIndex]]}
        </Box>
      </PageContent>
    </Page>
  );
}
