import {
  Box,
  Button,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import BankFinancialSummariesDataGrid from "components/BankFinancialSummaries/BankFinancialSummariesDataGrid";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  useGetBankFinancialSummariesByDateSubscription,
  useGetFundedLoansForBankSubscription,
} from "generated/graphql";
import {
  formatDatetimeString,
  parseDateStringServer,
  todayAsDateStringServer,
} from "lib/date";
import { bankRoutes } from "lib/routes";
import { useMemo } from "react";
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

export default function BankOverviewPage() {
  const classes = useStyles();

  const {
    data: latestBankFinancialSummariesData,
    error: latestBankFinancialSummariesError,
  } = useGetBankFinancialSummariesByDateSubscription({
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  const { data: fundedLoansData, error: fundedLoansError } =
    useGetFundedLoansForBankSubscription();

  if (latestBankFinancialSummariesError) {
    alert(
      "Error querying bank financial summaries. " +
        latestBankFinancialSummariesError.message
    );
  }

  if (fundedLoansError) {
    alert("Error querying loans. " + fundedLoansError.message);
  }

  const bankFinancialSummaries =
    latestBankFinancialSummariesData?.bank_financial_summaries || [];
  let filteredBankFinancialSummaries = bankFinancialSummaries;

  const loans = fundedLoansData?.loans;
  const maturingLoans = useMemo(
    () =>
      (loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + 14 * 24 * 60 * 60 * 1000
        );
        const maturityDate = parseDateStringServer(loan.adjusted_maturity_date);
        return (
          matureThreshold > maturityDate && pastDueThreshold < maturityDate
        );
      }),
    [loans]
  );
  const pastDueLoans = useMemo(
    () =>
      (loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const maturityDate = parseDateStringServer(loan.adjusted_maturity_date);
        return pastDueThreshold > maturityDate;
      }),
    [loans]
  );

  // Find the latest timestamp in the bank financial summaries and filter the list
  // based on that timestamp. There will be at most 4 items in this list (per the
  // query) so the cost of performing the filtering here is next to nothing. In
  // the fullness of time, we can remove this filtering step, but we only have
  // 2 product types available today (soon there will be 4).
  if (bankFinancialSummaries.length > 0) {
    const latestBankFinancialSummaryDate = bankFinancialSummaries
      .slice(0)
      .sort((a, b) => {
        return (
          parseDateStringServer(b.date).getTime() -
          parseDateStringServer(a.date).getTime()
        );
      })[0].date;

    filteredBankFinancialSummaries = bankFinancialSummaries.filter(
      (summary) => summary.date === latestBankFinancialSummaryDate
    );
  }

  const mostRecentSummary = !!filteredBankFinancialSummaries?.[0]
    ? filteredBankFinancialSummaries.reduce((a, b) =>
        a.updated_at > b.updated_at ? a : b
      )
    : null;

  return (
    <Page appBarTitle={"Overview"}>
      <PageContent title={"Overview"}>
        <Box className={classes.container}>
          <Box className={classes.section}>
            <Typography variant="h6" gutterBottom={true}>
              Dashboard
            </Typography>
            <Typography variant="body2" gutterBottom={true}>
              {`Note: dashboard is updated on an hourly cadence (last update: ${
                !!mostRecentSummary
                  ? formatDatetimeString(mostRecentSummary.updated_at) || "TBD"
                  : "TBD"
              }).`}
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
                  to={bankRoutes.loans}
                >
                  View all
                </Button>
              </Box>
            </Box>
            <Box style={{ height: "auto", width: "100%" }}>
              <LoansDataGrid
                isArtifactVisible
                isCompanyVisible
                isDisbursementIdentifierVisible
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
                  to={bankRoutes.loans}
                >
                  View all
                </Button>
              </Box>
            </Box>
            <Box style={{ height: "auto", width: "100%" }}>
              <LoansDataGrid
                isArtifactVisible
                isCompanyVisible
                isDaysPastDueVisible
                isDisbursementIdentifierVisible
                isMaturityVisible
                loans={pastDueLoans}
              />
            </Box>
          </Box>
        </Box>
      </PageContent>
    </Page>
  );
}
