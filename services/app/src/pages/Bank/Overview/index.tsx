import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import BankFinancialSummariesDataGrid from "components/BankFinancialSummaries/BankFinancialSummariesDataGrid";
import Page from "components/Shared/Page";
import {
  LoanStatusEnum,
  useGetLatestBankFinancialSummariesQuery,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import BankOverviewLoansTable from "pages/Bank/Overview/BankOverviewLoansTable";

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
      height: theme.spacing(4),
    },
    box: {
      width: "33%",
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
          <BankFinancialSummariesDataGrid
            bankFinancialSummaries={filteredBankFinancialSummaries}
          />
        </Box>
      </Box>
      <Box className={classes.section}>
        <BankOverviewLoansTable
          isMaturityVisible
          loans={maturingLoans}
          tableName={"Loans Maturing in 14 Days"}
          routeToTablePage={bankRoutes.loansMaturing}
          loansPastDue={false}
          matureDays={14}
        />
      </Box>
      <Box className={classes.section}>
        <BankOverviewLoansTable
          isMaturityVisible
          loans={pastDueLoans}
          tableName={"Loans Past Due"}
          routeToTablePage={bankRoutes.loansPastDue}
          loansPastDue={true}
        />
      </Box>
    </Page>
  );
}

export default BankOverviewPage;
