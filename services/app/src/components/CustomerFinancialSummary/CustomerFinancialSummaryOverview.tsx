import {
  Box,
  Card,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { FinancialSummaryFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import React from "react";
import StatBox from "./StatBox";

interface Props {
  isBalanceVisible?: boolean;
  financialSummary: FinancialSummaryFragment | null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "33%",
    },
  })
);

function CustomerFinancialSummaryOverview({
  isBalanceVisible = true,
  financialSummary,
}: Props) {
  const classes = useStyles();

  const minimumMonthlyPayload = financialSummary?.minimum_monthly_payload;
  const accountBalancePayload = financialSummary?.account_level_balance_payload;

  let minimumMonthlyFee = -1;
  if (minimumMonthlyPayload && Object.keys(minimumMonthlyPayload).length > 0) {
    // Three keys you can read from:
    // amount_short: How much you will be charged extra for not using the product enough
    // minimum_amount: What is the minimum required revenue Bespoke gets from interest.
    // amount_accrued: How much you will pay this month in interest
    minimumMonthlyFee = minimumMonthlyPayload.amount_short;
  }

  let accountFees = -1;
  let accountCredits = -1;
  if (accountBalancePayload && Object.keys(accountBalancePayload).length > 0) {
    // Keys you can use:
    //  fees_total: How many account-level fees in $ you owe currently
    //  credits_total: How many credits does Bespoke owe you due to overpayments
    accountFees = accountBalancePayload.fees_total;
    accountCredits = accountBalancePayload.credits_total;
  }
  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="h6" gutterBottom={true}>
        Dashboard
      </Typography>
      <Typography variant="body2" gutterBottom={true}>
        Note: dashboard is updated every minute.
      </Typography>
      {isBalanceVisible && (
        <>
          <Box>
            <h3>Loans</h3>
          </Box>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box className={classes.box}>
              <Card>
                <Box display="flex" flexDirection="column" p={2}>
                  <Typography variant="h4">
                    {financialSummary
                      ? formatCurrency(
                          financialSummary?.total_outstanding_principal
                        )
                      : "TBD"}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Outstanding Principal
                  </Typography>
                </Box>
              </Card>
            </Box>
            <Box className={classes.box}>
              <Card>
                <Box display="flex" flexDirection="column" p={2}>
                  <Typography variant="h4">
                    {financialSummary
                      ? formatCurrency(
                          financialSummary?.total_outstanding_interest
                        )
                      : "TBD"}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Accrued Interest
                  </Typography>
                </Box>
              </Card>
            </Box>
            <Box className={classes.box}>
              <Card>
                <Box display="flex" flexDirection="column" p={2}>
                  <Typography variant="h4">
                    {financialSummary
                      ? formatCurrency(financialSummary?.total_outstanding_fees)
                      : "TBD"}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Accrued Fees
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>
          <Box mt={1} />
        </>
      )}
      <Box>
        <h3>Account</h3>
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {minimumMonthlyFee !== -1
                  ? formatCurrency(minimumMonthlyFee)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Minimum Monthly Fee
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {accountFees !== -1 ? formatCurrency(accountFees) : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Account Fees
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {accountCredits !== -1 ? formatCurrency(accountCredits) : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Account Credits
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box mt={1} />
      </Box>
      <Box>
        <h3>Limits</h3>
      </Box>
      <Box mt={1} />
      <StatBox financialSummary={financialSummary} />
    </Box>
  );
}

export default CustomerFinancialSummaryOverview;
