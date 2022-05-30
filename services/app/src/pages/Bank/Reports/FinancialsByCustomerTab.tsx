import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  useGetCustomersForDropdownQuery,
  useGetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useState } from "react";
import { useHistory } from "react-router-dom";

export default function BankReportsFinancialsByCustomerTab() {
  const history = useHistory();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");

  const { data: customersData, error: customersError } =
    useGetCustomersForDropdownQuery({
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
        {!!companyId && (
          <Box display="flex" flexDirection="column">
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
                        payments applied on <strong>deposit date</strong> as of{" "}
                        <strong>end of date</strong>
                      </Typography>
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2">
                        PB Including Clearance Days: total outstanding principal
                        with payments applied on{" "}
                        <strong>settlement date</strong> as of{" "}
                        <strong>end of date</strong>
                      </Typography>
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2">
                        Amount to Pay Interest On: total outstanding principal
                        as of <strong>start of date</strong> (no payments
                        applied yet)
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
              {financialSummariesByCompanyId.length > 0 ? (
                <FinancialSummariesDataGrid
                  isProductTypeVisible
                  financialSummaries={financialSummariesByCompanyId}
                  handleClickCustomer={(customerId) =>
                    history.push(
                      getBankCompanyRoute(
                        customerId,
                        BankCompanyRouteEnum.Overview
                      )
                    )
                  }
                />
              ) : (
                <Typography variant="body2">No financial summaries</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
