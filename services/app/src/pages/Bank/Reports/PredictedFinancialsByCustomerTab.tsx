import {
  Box,
  FormControl,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PredictedFinancialSummariesDataGrid from "components/CustomerFinancialSummaries/PredictedFinancialSummariesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  ContractFragment,
  FinancialSummaryWithLoansInfoFragment,
  useGetActiveCustomersForDropdownQuery,
  useGetFinancialSummariesAndLoansByCompanyIdQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { ProductConfigField } from "lib/contracts";
import {
  dateAsDateStringServer,
  getDatesInRange,
  parseDateStringServer,
} from "lib/date";
import { ProductTypeEnum } from "lib/enum";
import { runCustomerLoanPredictionsMutation } from "lib/finance/loans/reports";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

/*
  This function extracts out the late fee multiplier from the relevant
  loan's late fee schedule. This is used later as a lookup value to
  pull information based on how late a given loan is on a specific day.
  This allows the excel export to use the late fee multiplier as number
  without any additional processing on the end user's part.
*/
const getDateToLateFeeSchedules = (
  companyContracts: ContractFragment[],
  financialSummariesByCompanyId: FinancialSummaryWithLoansInfoFragment[],
  predictionDate: string
): Record<string, LateFeeSchedule[]> => {
  const lateFeeSchedules = companyContracts.map((contract) => {
    const startDate = contract?.start_date || null;
    const endDate = contract?.adjusted_end_date || null;
    const fields: ProductConfigField[] =
      contract?.product_config?.v1?.fields || [];
    const lateFeeSchedule = fields.find(
      (field) => field["internal_name"] === "late_fee_structure"
    );

    return {
      startDate: parseDateStringServer(startDate),
      endDate: parseDateStringServer(endDate),
      lateFeeSchedule: lateFeeSchedule,
    } as ContractLateFeeSchedule;
  });

  const oldestFinancialSummary =
    financialSummariesByCompanyId.length > 0
      ? financialSummariesByCompanyId[financialSummariesByCompanyId.length - 1]
      : null;
  const firstSummaryDate = !!oldestFinancialSummary
    ? oldestFinancialSummary.date
    : null;
  const dateRange =
    !!firstSummaryDate && !!predictionDate
      ? getDatesInRange(firstSummaryDate, predictionDate)
      : [];

  // We use these in the below map, but no need to redefine the regex every iteration
  const betweenPeriodRegex = new RegExp("[0-9]+-[0-9]+");
  const afterPeriodRegex = new RegExp("[0-9]+[+]{1}");

  const dateToLateFeeSchedule: Record<string, LateFeeSchedule[]> =
    Object.fromEntries(
      dateRange.map((date) => {
        const contemporarySchedule = lateFeeSchedules.find((schedule) => {
          return date >= schedule.startDate && date <= schedule.endDate;
        });
        const dateString = dateAsDateStringServer(date);

        const scheduleConfig = !!contemporarySchedule?.lateFeeSchedule
          ? contemporarySchedule.lateFeeSchedule
          : {};
        // We recast as string because the ProductConfigField interface correctly has the
        // the type as string | number, which was needed for iterated over product config
        // But since we're using the late_fee_schedule field we know we have a string
        const scheduleString = !!scheduleConfig
          ? ((scheduleConfig as ProductConfigField)["value"] as string)
          : "{}";
        const schedule = !!scheduleString ? JSON.parse(scheduleString) : {};

        // Here we break apart the fee schedule even more so that the final column
        // value can determine where it sits in the late ranges and display the appropriate value
        const scheduleEntries = Object.entries(schedule).map((key, value) => {
          // toString to make tsc happy, it's always a string
          const keyString = key.toString();

          const isBetweenPeriod = betweenPeriodRegex.test(keyString);
          const isAfterPeriod = afterPeriodRegex.test(keyString);

          const start = !!isBetweenPeriod
            ? Number(keyString.split("-")[0])
            : !!isAfterPeriod
            ? Number(keyString.split("+")[0])
            : -1;

          const end = !!isBetweenPeriod
            ? Number(keyString.split("-")[1].split(",")[0])
            : -1;

          const fee = !!isBetweenPeriod
            ? Number(keyString.split("-")[1].split(",")[1])
            : !!isAfterPeriod
            ? Number(keyString.split("+")[1].split(",")[1])
            : 0;

          return {
            start: start,
            end: end,
            fee: fee,
            original: { [keyString]: value },
          } as LateFeeSchedule;
        });

        return [dateString, scheduleEntries];
      })
    );

  return dateToLateFeeSchedule;
};

interface LoanPrediction {
  dailyInterestRate: number;
  feesAccruedToday: number;
  interestAccruedToday: number;
  lateFeesAccruedToday: number;
  loanId: string;
  outstandingFees: number;
  outstandingInterest: number;
  outstandingPrincipal: number;
}

export interface DailyLoanPrediction {
  date: string;
  predictions: LoanPrediction[];
}

// Used for pulling out the string based fee schedule from contract
interface ContractLateFeeSchedule {
  startDate: Date;
  endDate: Date;
  lateFeeSchedule: object;
}

// Used for mapping between days late and fee schedule value
export interface LateFeeSchedule {
  start: number;
  end: number;
  fee: number;
  original: Record<string, number>;
}

export default function BankReportsFinancialsByCustomerTab() {
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const classes = useStyles();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  const [predictionDate, setPredictionDate] = useState<string>("");
  const [loanPredictions, setLoanPredictions] = useState<DailyLoanPrediction[]>(
    []
  );

  const [isPredictionProcessRunning, setIsPredictionProcessRunning] =
    useState<boolean>(false);
  const [predictionIteration, setPredictionIteration] = useState<number>(0);
  const [predictionMax, setPredictionMax] = useState<number>(0);

  const { data: customersData, error: customersError } =
    useGetActiveCustomersForDropdownQuery({
      fetchPolicy: "network-only",
    });

  const {
    data: financialSummariesAndLoansByCompanyIdData,
    error: financialSummariesAndLoansByCompanyIdError,
  } = useGetFinancialSummariesAndLoansByCompanyIdQuery({
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

  if (financialSummariesAndLoansByCompanyIdError) {
    console.error({ error: financialSummariesAndLoansByCompanyIdError });
    alert(
      `Error in query (details in console): ${financialSummariesAndLoansByCompanyIdError.message}`
    );
  }

  const customers = customersData?.customers || [];

  const financialSummariesByCompanyId =
    financialSummariesAndLoansByCompanyIdData?.companies_by_pk
      ?.financial_summaries || [];

  // Since we cannot guarantee that the most recent contract will have the
  // same late fee schedule as all contracts for a customer, and we are
  // pulling historical financial summaries in addition to loan preditions
  // we must grab all contract and pull out the late fee schedules for each one
  const productType =
    financialSummariesByCompanyId?.[0]?.product_type || ProductTypeEnum.None;
  const companyContracts =
    financialSummariesAndLoansByCompanyIdData?.companies_by_pk?.contracts || [];
  const dateToLateFeeSchedule =
    !!predictionDate && productType !== ProductTypeEnum.LineOfCredit
      ? getDateToLateFeeSchedules(
          companyContracts,
          financialSummariesByCompanyId,
          predictionDate
        )
      : {};

  const companyIdentifier =
    financialSummariesAndLoansByCompanyIdData?.companies_by_pk?.identifier ||
    "";
  const companyName =
    financialSummariesAndLoansByCompanyIdData?.companies_by_pk?.name || "";
  const companyLoans =
    financialSummariesAndLoansByCompanyIdData?.companies_by_pk?.loans || [];
  const loanMaturityDateLookup = Object.fromEntries(
    companyLoans.map((loan) => [loan.id, loan.adjusted_maturity_date])
  );

  const [
    runCustomerLoanPredictions,
    { loading: isRunCustomerLoanPredictionsLoading },
  ] = useCustomMutation(runCustomerLoanPredictionsMutation);

  const fetchLoanPredictions = function (predictionDate: string) {
    const tomorrowObject = new Date();
    tomorrowObject.setDate(tomorrowObject.getDate() + 1);
    const tomorrow = dateAsDateStringServer(tomorrowObject);

    const dateRange = !!predictionDate
      ? getDatesInRange(tomorrow, predictionDate)
      : [];

    const getPredictions = async () => {
      setIsPredictionProcessRunning(true);
      let predictions: DailyLoanPrediction[] = [];
      const getData = async (dateRange: Date[]) => {
        setPredictionMax(dateRange.length);
        for (const [i, futureDate] of dateRange.entries()) {
          setPredictionIteration(i + 1);
          const response = await runCustomerLoanPredictions({
            variables: {
              company_id: companyId,
              prediction_date: dateAsDateStringServer(futureDate),
            },
          });

          if (response.status !== "OK") {
            snackbar.showError(`Error: ${response.msg}`);
          } else if (response.errors && response.errors.length > 0) {
            snackbar.showWarning(`Error: ${response.errors}`);
          } else {
            const datePrediction = response.data?.loan_prediction_by_date;
            if (!datePrediction) {
              console.error("Developer error!");
            }

            // Since we're running days individually, we have to unwrap the array
            predictions.push(datePrediction[0]);
          }
        }

        setPredictionIteration(0);
        setPredictionMax(0);
      };

      await getData(dateRange);
      setLoanPredictions(
        predictions.sort((a, b) => {
          return a.date > b.date ? -1 : 1;
        })
      );
      setIsPredictionProcessRunning(false);
    };
    getPredictions();
  };

  const isPredictionDataGridReady =
    financialSummariesByCompanyId.length > 0 &&
    !!predictionDate &&
    !isRunCustomerLoanPredictionsLoading &&
    !!loanPredictions &&
    !isPredictionProcessRunning;

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
              onChange={(_event, customer) => {
                setCompanyId(customer?.id || null);
                setPredictionDate("");
              }}
            />
          </FormControl>
        </Box>
        {isPredictionProcessRunning && (
          <Box display="flex" flexDirection="column">
            The financial prediction process is running, currently on day{" "}
            {predictionIteration} of {predictionMax}.
          </Box>
        )}
        {!!companyId && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column">
              <Box mb={2}>
                <DateInput
                  disablePast
                  className={classes.inputField}
                  id="predict-financials-by-customer-tab-date-picker"
                  label="Prediction Date"
                  value={predictionDate}
                  onChange={(value) => {
                    setPredictionDate(value || "");
                    fetchLoanPredictions(value || "");
                  }}
                />
              </Box>
              {!!isPredictionDataGridReady ? (
                <PredictedFinancialSummariesDataGrid
                  companyId={companyId}
                  companyIdentifier={companyIdentifier}
                  companyName={companyName}
                  dateToLateFeeSchedule={dateToLateFeeSchedule}
                  financialSummaries={financialSummariesByCompanyId}
                  loanMaturityDateLookup={loanMaturityDateLookup}
                  loanPredictions={loanPredictions}
                  handleClickCustomer={(customerId) =>
                    navigate(
                      getBankCompanyRoute(
                        customerId,
                        BankCompanyRouteEnum.Overview
                      )
                    )
                  }
                />
              ) : (
                <Box mb={2}>
                  <Alert severity="info">
                    <Box display="flex" flexDirection="column">
                      <Box>
                        <Typography variant="body2">
                          Please select the date you would like to predict loan
                          values out until.
                        </Typography>
                      </Box>
                    </Box>
                  </Alert>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
