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
import { BankCompaniesTabLabel } from "lib/enum";
import CompaniesCompaniesTab from "pages/Bank/Companies/CompaniesCompaniesTab";
import CompaniesCustomersTab from "pages/Bank/Companies/CompaniesCustomersTab";
import CompaniesParentCompaniesTab from "pages/Bank/Companies/CompaniesParentCompaniesTab";
import CompaniesPayorsTab from "pages/Bank/Companies/CompaniesPayorsTab";
import CompaniesVendorsTab from "pages/Bank/Companies/CompaniesVendorsTab";
import { useState } from "react";

export default function BankCompaniesPage() {
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
            <Tab
              data-cy={`${BankCompaniesTabLabel.Customers}-tab`
                .replace(/\s+/g, "-")
                .toLowerCase()}
              label={`${BankCompaniesTabLabel.Customers}`}
            />
            <Tab
              data-cy={`${BankCompaniesTabLabel.Vendors}-tab`
                .replace(/\s+/g, "-")
                .toLowerCase()}
              label={`${BankCompaniesTabLabel.Vendors}`}
            />
            <Tab
              data-cy={`${BankCompaniesTabLabel.Payors}-tab`
                .replace(/\s+/g, "-")
                .toLowerCase()}
              label={`${BankCompaniesTabLabel.Payors}`}
            />
            <Tab
              data-cy={`${BankCompaniesTabLabel.Companies}-tab`
                .replace(/\s+/g, "-")
                .toLowerCase()}
              label={`${BankCompaniesTabLabel.Companies}`}
            />
            <Tab
              data-cy={`${BankCompaniesTabLabel.ParentCompanies}-tab`
                .replace(/\s+/g, "-")
                .toLowerCase()}
              label={BankCompaniesTabLabel.ParentCompanies}
            />
          </Tabs>
          {selectedTabIndex === 0 ? (
            <CompaniesCustomersTab
              data-cy={"customers-tab"}
              setSelectedTabIndex={setSelectedTabIndex}
            />
          ) : selectedTabIndex === 1 ? (
            <CompaniesVendorsTab data-cy={"vendors-tab"} />
          ) : selectedTabIndex === 2 ? (
            <CompaniesPayorsTab data-cy={"vendors-tab"} />
          ) : selectedTabIndex === 3 ? (
            <CompaniesCompaniesTab data-cy={"companies-tab"} />
          ) : (
            <CompaniesParentCompaniesTab data-cy={"parent-companies-tab"} />
          )}
        </Box>
      </PageContent>
    </Page>
  );
}
