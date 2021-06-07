import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  Loans,
  useGetAllLoansForCompanyQuery,
} from "generated/graphql";
import { useState } from "react";
import useSnackbar from "hooks/useSnackbar";
import useCustomMutation from "hooks/useCustomMutation";
import { todayAsDateStringServer } from "lib/date";
import { runCustomerBalancesMutation } from "lib/finance/loans/reports";
import LoanFinancialSummariesDataGrid from "components/Loans/LoanFinancialSummariesDataGrid";
import { orderBy, zipObject } from "lodash";
import { createLoanDisbursementIdentifier } from "lib/loans";
import { useMemo } from "react";

export default function BankReportsFinancialsByCustomerTab() {
  const snackbar = useSnackbar();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  const [loanId, setLoanId] = useState<Loans["id"]>("");
  const [
    loanIdToFinancialSummaries,
    setLoanIdToFinancialSummaries,
  ] = useState<any>(null);

  const {
    data: customersData,
    error: customersError,
  } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
  });

  const { data: loansData, error: loansError } = useGetAllLoansForCompanyQuery({
    skip: !companyId,
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (customersError) {
    console.error({ error: customersError });
    alert(`Error in query (details in console): ${customersError.message}`);
  }

  if (loansError) {
    console.error({ error: loansError });
    alert(`Error in query (details in console): ${loansError.message}`);
  }

  const customers = customersData?.customers || [];
  const loans = loansData?.loans || [];

  const [
    runCustomerBalances,
    { loading: isRunCustomerBalancesLoading },
  ] = useCustomMutation(runCustomerBalancesMutation);

  const fetchFinancials = async function (newCompanyId: Companies["id"]) {
    const reportDate = todayAsDateStringServer();
    const response = await runCustomerBalances({
      variables: {
        company_id: newCompanyId,
        start_date: reportDate,
        report_date: reportDate,
        include_debug_info: true,
      },
    });

    console.log({ type: "runCustomerBalances", response });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else if (response.errors && response.errors.length > 0) {
      snackbar.showWarning(`Error: ${response.errors}`);
    } else {
      const loanIdToDebugInfo = response.data?.loan_id_to_debug_info;
      if (!loanIdToDebugInfo) {
        console.error("Developer error!");
      }

      const loanIdToFinancialSummaries = Object.keys(loanIdToDebugInfo).map(
        (loanId) => {
          const loanDebugInfo = loanIdToDebugInfo[loanId];
          const updateStates: any[] = loanDebugInfo.update_states;
          const loanFinancialSummaries = updateStates.map(
            (updateState: any) => updateState.row_info
          );
          return {
            loanId: loanId,
            financialSummaries: loanFinancialSummaries,
          };
        }
      );
      setLoanIdToFinancialSummaries(loanIdToFinancialSummaries);

      snackbar.showSuccess(
        "Financials calculated: select a loan to view its financial history."
      );
    }
  };

  const isResultsFetched = !!loanIdToFinancialSummaries;

  const financialSummaries = useMemo(() => {
    if (!loanIdToFinancialSummaries) {
      return null;
    }
    if (!loanId) {
      return null;
    }

    const selectedTuple = loanIdToFinancialSummaries.find(
      (tuple: any) => tuple.loanId === loanId
    );
    if (!selectedTuple) {
      console.error("Developer error!");
      return null;
    }
    const unzippedFinancialSummaries = selectedTuple.financialSummaries as any;
    const columnNames = [
      "date",
      "outstanding_principal",
      "outstanding_principal_for_interest",
      "outstanding_interest",
      "outstanding_fees",
      "interest_due_for_day",
      "fee_for_day",
      "interest_rate",
      "fee_multiplier",
    ];
    const zippedFinancialSummaries = unzippedFinancialSummaries.map(
      (values: any) => zipObject(columnNames, values)
    );
    return orderBy(zippedFinancialSummaries, "date", "desc");
  }, [loanId, loanIdToFinancialSummaries]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box display="flex" flexDirection="column" width={400} mr={2}>
            <FormControl>
              <Autocomplete
                autoHighlight
                blurOnSelect
                disabled={customers.length <= 0 || isRunCustomerBalancesLoading}
                options={customers}
                getOptionLabel={(customer) => customer.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select customer"
                    variant="outlined"
                  />
                )}
                onChange={(_event, customer) => {
                  const newCompanyId = customer?.id || null;
                  setCompanyId(newCompanyId);
                  setLoanId(null);
                  setLoanIdToFinancialSummaries(null);

                  if (newCompanyId) {
                    fetchFinancials(newCompanyId);
                  }
                }}
              />
            </FormControl>
          </Box>
          {isRunCustomerBalancesLoading && (
            <Typography variant="body1">Loading...</Typography>
          )}
        </Box>
        {!!isResultsFetched && (
          <>
            <Box mb={2}>
              <Typography variant="body1">
                {`${loans.length} loan(s) available`}
              </Typography>
            </Box>
            <Box display="flex" alignItems="flex-end" mb={2}>
              <Box display="flex" flexDirection="column" width={400}>
                <FormControl>
                  <Autocomplete
                    autoHighlight
                    blurOnSelect
                    disabled={loans.length <= 0}
                    options={loans}
                    getOptionLabel={(loan) =>
                      `${createLoanDisbursementIdentifier(loan)} (${loan.id})`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select loan"
                        variant="outlined"
                      />
                    )}
                    onChange={(_event, loan) => setLoanId(loan?.id || null)}
                  />
                </FormControl>
              </Box>
            </Box>
          </>
        )}
        <Box display="flex" flexDirection="column">
          {financialSummaries && (
            <LoanFinancialSummariesDataGrid
              financialSummaries={financialSummaries}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
