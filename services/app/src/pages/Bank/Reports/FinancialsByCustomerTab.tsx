import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  useGetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import Can from "components/Shared/Can";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Action } from "lib/auth/rbac-rules";

export default function BankReportsFinancialsByCustomerTab() {
  const history = useHistory();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");

  const {
    data: customersData,
    error: customersError,
  } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
  });

  const {
    data: financialSummariesByCompanyIdData,
    error: financialSummariesByCompanyIdError,
    refetch: financialSummariesByCompanyIdRefetch,
  } = useGetFinancialSummariesByCompanyIdQuery({
    fetchPolicy: "network-only",
    skip: !companyId,
    variables: {
      companyId: companyId,
    },
  });

  if (customersError) {
    console.error({ error: customersError });
    alert(`Error in query (details in console): ${customersError.message}`);
  }

  if (financialSummariesByCompanyIdError) {
    console.error({ error: financialSummariesByCompanyIdError });
    alert(
      `Error in query (details in console): ${financialSummariesByCompanyIdError.message}`
    );
  }

  const customers = customersData?.customers || [];

  const financialSummariesByCompanyId =
    financialSummariesByCompanyIdData?.financial_summaries || [];

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Box display="flex" flexDirection="column" width={400} mb={2}>
          <FormControl>
            <Autocomplete
              autoHighlight
              blurOnSelect
              disabled={customers.length <= 0}
              options={customers}
              getOptionLabel={(customer) => customer.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select customer"
                  variant="outlined"
                />
              )}
              onChange={(_event, customer) =>
                setCompanyId(customer?.id || null)
              }
            />
          </FormControl>
        </Box>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          <Can perform={Action.RunBalances}>
            <Box>
              <ModalButton
                isDisabled={!companyId}
                label={"Run Balances"}
                color={"default"}
                modal={({ handleClose }) => (
                  <RunCustomerBalancesModal
                    companyId={companyId}
                    handleClose={() => {
                      financialSummariesByCompanyIdRefetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <Box display="flex" flexDirection="column">
          <Box mb={2}>
            <Alert severity="info">
              <Box display="flex" flexDirection="column">
                <Box>
                  <Typography variant="body2">
                    Principal Balance (PB): total outstanding principal with
                    payments applied on <b>deposit date</b> as of{" "}
                    <b>end of date</b>
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Typography variant="body2">
                    PB Including Clearance Days: total outstanding principal
                    with payments applied on <b>settlement date</b> as of{" "}
                    <b>end of date</b>
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Typography variant="body2">
                    Amount to Pay Interest On: total outstanding principal as of{" "}
                    <b>start of date</b> (no payments applied yet)
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Typography variant="body2">
                    Interest Accrued Today = Amount to Pay Interest On *
                    Interest Rate
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </Box>
          <FinancialSummariesDataGrid
            financialSummaries={financialSummariesByCompanyId}
            handleClickCustomer={(customerId) =>
              history.push(`/customers/${customerId}/overview`)
            }
          />
        </Box>
      </Box>
    </Box>
  );
}
