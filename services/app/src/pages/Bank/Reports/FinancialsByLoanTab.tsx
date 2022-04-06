import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  Companies,
  useGetCustomersForDropdownQuery,
  Loans,
  useGetAllLoansForCompanyQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import useCustomMutation from "hooks/useCustomMutation";
import { todayAsDateStringServer } from "lib/date";
import { runCustomerBalancesMutation } from "lib/finance/loans/reports";
import LoanFinancialSummariesDataGrid from "components/Loans/LoanFinancialSummariesDataGrid";
import { orderBy, zipObject } from "lodash";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { useMemo, useState } from "react";

export default function BankReportsFinancialsByCustomerTab() {
  const snackbar = useSnackbar();

  // Company ID is empty until user selects a company from dropdown.
  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  // Loan ID is empty until user selects a loan from dropdown.
  const [loanId, setLoanId] = useState<Loans["id"]>("");
  const [
    loanIdToFinancialSummaries,
    setLoanIdToFinancialSummaries,
  ] = useState<any>(null);

  const {
    data: customersData,
    loading: isCustomersLoading,
    error: customersError,
  } = useGetCustomersForDropdownQuery({
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
      "amount_to_pay_interest_on",
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

  const isLoanOptionsLoading =
    isCustomersLoading || isRunCustomerBalancesLoading;
  const isResultsFetched = !!loanIdToFinancialSummaries;

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box display="flex" flexDirection="column" width={400} mr={2}>
            <FormControl>
              <Autocomplete
                autoHighlight
                blurOnSelect
                disabled={customers.length <= 0 || isLoanOptionsLoading}
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
          {isLoanOptionsLoading && (
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
                    getOptionLabel={(loan) => {
                      // Show both customer and disbursement identifier so user
                      // can search through options for either loan identifier.
                      return `${createLoanCustomerIdentifier(
                        loan
                      )} | ${createLoanDisbursementIdentifier(loan)}`;
                    }}
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
        {!!loanId && (
          <Box display="flex" flexDirection="column">
            <Box mb={2}>
              <Typography variant="body2">{`Platform ID: ${loanId}`}</Typography>
            </Box>
            {financialSummaries ? (
              <LoanFinancialSummariesDataGrid
                financialSummaries={financialSummaries}
              />
            ) : (
              <Typography>{`No financial summaries`}</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
