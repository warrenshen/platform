import {
  Box,
  Button,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      marginBottom: theme.spacing(4),
    },
    inputField: {
      width: 300,
    },
  })
);

export default function BankReportsFinancialsByCustomerTab() {
  const classes = useStyles();
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

  const reportDate = todayAsDateStringServer();
  // const [reportDate, setReportDate] = useState<string | null>(
  //   todayAsDateStringServer()
  // );

  const [
    runCustomerBalances,
    { loading: isRunCustomerBalancesLoading },
  ] = useCustomMutation(runCustomerBalancesMutation);

  const handleClickSubmit = async () => {
    if (!reportDate || !companyId) {
      console.error("Developer error!");
    } else {
      const response = await runCustomerBalances({
        variables: {
          company_id: companyId,
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
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box display="flex" alignItems="flex-end" mb={2}>
          <Box mr={2}>
            <FormControl className={classes.inputField}>
              <InputLabel id="customer-select-label">Customer</InputLabel>
              <Select
                disabled={customers.length <= 0}
                labelId="customer-select-label"
                id="customer-select"
                value={companyId}
                onChange={({ target: { value } }) =>
                  setCompanyId(value as string)
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mr={2}>
            <Button
              disabled={!companyId || isRunCustomerBalancesLoading}
              variant="contained"
              color="default"
              onClick={handleClickSubmit}
            >
              Submit
            </Button>
          </Box>
        </Box>
        {!!isResultsFetched && (
          <Box display="flex" alignItems="flex-end" mb={2}>
            <Box>
              <FormControl className={classes.inputField}>
                <InputLabel id="loan-select-label">Loan</InputLabel>
                <Select
                  disabled={customers.length <= 0}
                  labelId="loan-select-label"
                  id="loan-select"
                  value={loanId}
                  onChange={({ target: { value } }) =>
                    setLoanId(value as string)
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {loans.map((loan) => (
                    <MenuItem key={loan.id} value={loan.id}>
                      {`${createLoanDisbursementIdentifier(loan)} (${loan.id})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
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
