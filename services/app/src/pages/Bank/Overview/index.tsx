import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import BankFinancialSummariesDataGrid from "components/BankFinancialSummaries/BankFinancialSummariesDataGrid";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import {
  LoanStatusEnum,
  useGetLatestBankFinancialSummariesQuery,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import { Link } from "react-router-dom";

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
  })
);

function BankOverviewPage() {
  const classes = useStyles();

  const {
    data: latestBankFinancialSummariesData,
    error: latestBankFinancialSummariesError,
  } = useGetLatestBankFinancialSummariesQuery();

  const {
    data: maturingLoansData,
    error: maturingLoansError,
  } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.Funded],
    },
  });

  const {
    data: pastDueLoansData,
    error: pastDueLoansError,
  } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.PastDue],
    },
  });

  if (latestBankFinancialSummariesError) {
    alert(
      "Error querying bank financial summaries. " +
        latestBankFinancialSummariesError
    );
  }

  if (maturingLoansError) {
    alert("Error querying maturing loans. " + maturingLoansError);
  }

  if (pastDueLoansError) {
    alert("Error querying past due loans. " + pastDueLoansError);
  }

  const bankFinancialSummaries =
    latestBankFinancialSummariesData?.bank_financial_summaries || [];
  let filteredBankFinancialSummaries = bankFinancialSummaries;

  const maturingLoans = maturingLoansData?.loans || [];
  const pastDueLoans = pastDueLoansData?.loans || [];

  // Find the latest timestamp in the bank financial summaries and filter the list
  // based on that timestamp. There will be at most 4 items in this list (per the
  // query) so the cost of performing the filtering here is next to nothing. In
  // the fullness of time, we can remove this filtering step, but we only have
  // 2 product types available today (soon there will be 4).
  if (bankFinancialSummaries.length > 0) {
    const latestBankFinancialSummaryDate = bankFinancialSummaries
      .slice(0)
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })[0].date;

    filteredBankFinancialSummaries = bankFinancialSummaries.filter(
      (summary) => summary.date === latestBankFinancialSummaryDate
    );
  }

  return (
    <Page appBarTitle={"Overview"}>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Typography variant="h6" gutterBottom={true}>
            Financial Summaries by Product Type
          </Typography>
          <Typography variant="body2" gutterBottom={true}>
            Note: financial summaries are updated on an hourly candence.
          </Typography>
          <BankFinancialSummariesDataGrid
            bankFinancialSummaries={filteredBankFinancialSummaries}
          />
        </Box>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6" gutterBottom={true}>
          Loans Maturing in 14 Days
        </Typography>
        <Box display="flex" flexDirection="column">
          <Box pb={2} display="flex">
            <Box mr={2} mt={"auto"} mb={"auto"}>
              <Button
                size="small"
                color="primary"
                variant="contained"
                component={Link}
                to={bankRoutes.loansMaturing}
              >
                View all
              </Button>
            </Box>
          </Box>
          <Box style={{ height: "auto", width: "100%" }}>
            <BankLoansDataGrid
              isMaturityVisible
              matureDays={14}
              loans={maturingLoans}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6" gutterBottom={true}>
          Loans Past Due
        </Typography>
        <Box display="flex" flexDirection="column">
          <Box pb={2} display="flex">
            <Box mr={2} mt={"auto"} mb={"auto"}>
              <Button
                size="small"
                color="primary"
                variant="contained"
                component={Link}
                to={bankRoutes.loansPastDue}
              >
                View all
              </Button>
            </Box>
          </Box>
          <Box style={{ height: "auto", width: "100%" }}>
            <BankLoansDataGrid
              isDaysPastDueVisible
              isMaturityVisible
              loans={pastDueLoans}
            />
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default BankOverviewPage;
