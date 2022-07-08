import { Box, Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import CustomersDataGrid from "components/Customer/CustomersDataGrid";
import CreateBulkMinimumMonthlyFeeModal from "components/Fee/CreateMinimumInterestFeesModal";
import CreateMonthEndPaymentsModal from "components/Fee/CreateMonthEndPaymentsModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import KickoffMonthlySummaryEmailsModal from "components/Reports/KickoffMonthlySummaryEmailsModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  CustomersWithMetadataFragment,
  useGetActiveCustomersWithMetadataQuery,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { useFilterCustomersByFragment } from "hooks/useFilterCustomers";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { ChangeEvent, useContext, useMemo, useState } from "react";

export default function BankCustomersPage() {
  const [isActiveSelected, setIsActiveSelected] = useState(true);

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const {
    data: allData,
    refetch: refetchAllData,
    error: allError,
  } = useGetCustomersWithMetadataQuery({
    skip: !!isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allError) {
    console.error({ allError });
    alert(`Error in query (details in console): ${allError.message}`);
  }

  const {
    data: activeData,
    refetch: refetchActiveData,
    error: allActiveError,
  } = useGetActiveCustomersWithMetadataQuery({
    skip: !isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allActiveError) {
    console.error({ allActiveError });
    alert(`Error in query (details in console): ${allActiveError.message}`);
  }

  const data = useMemo(
    () =>
      !!isActiveSelected
        ? activeData?.customers || []
        : allData?.customers || [],
    [isActiveSelected, activeData, allData]
  );

  const [searchQuery, setSearchQuery] = useState("");

  const customers = useFilterCustomersByFragment(
    searchQuery,
    data
  ) as CustomersWithMetadataFragment[];

  return (
    <Page appBarTitle={"Customers"}>
      <PageContent
        title={"Customers"}
        bankActions={
          <>
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
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
        <Box
          display="flex"
          style={{ marginBottom: "1rem" }}
          justifyContent="space-between"
        >
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by customer identifier or name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 300 }}
            />
            <Box pt={1.5} ml={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={isActiveSelected}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsActiveSelected(event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={"Is customer active?"}
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection="row-reverse">
            {check(role, Action.EditCustomerSettings) && (
              <Box>
                <ModalButton
                  dataCy={"create-customer-button"}
                  label={"Create Customer"}
                  color={"primary"}
                  modal={({ handleClose }) => (
                    <CreateCustomerModal
                      handleClose={() => {
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <CustomersDataGrid
            customers={customers}
            selectedCompanyIds={selectedCompanyIds}
            setSelectedCompanyIds={setSelectedCompanyIds}
          />
        </Box>
      </PageContent>
    </Page>
  );
}
