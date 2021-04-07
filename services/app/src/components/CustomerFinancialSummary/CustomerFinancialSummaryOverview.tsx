import {
  Box,
  createStyles,
  Divider,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { FinancialSummaryFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import StatBox from "./StatBox";

interface Props {
  isBalanceVisible?: boolean;
  financialSummary: FinancialSummaryFragment | null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "20%",
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
    <Box display="flex" flexDirection="column" mt={2}>
      {isBalanceVisible && (
        <>
          <Box display="flex" width="100%" justifyContent="space-between">
            <Box display="flex" flexDirection="column">
              <Box display="flex">
                <Box display="flex" flexDirection="column" mb={6}>
                  <Typography variant="h2">
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
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" flexDirection="column">
                  <Typography variant="h5">
                    {financialSummary
                      ? formatCurrency(financialSummary?.adjusted_total_limit)
                      : "TBD"}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Borrowing Limit
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column">
                  <Typography variant="h5">
                    {financialSummary
                      ? formatCurrency(financialSummary?.available_limit)
                      : "TBD"}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Left to Borrow
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <StatBox financialSummary={financialSummary} />
            </Box>
          </Box>
          <Box my={8}>
            <Divider />
          </Box>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box className={classes.box}>
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
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
            </Box>
            <Box className={classes.box}>
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
                  {financialSummary
                    ? formatCurrency(financialSummary?.total_outstanding_fees)
                    : "TBD"}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Accrued Fees
                </Typography>
              </Box>
            </Box>
            <Box className={classes.box}>
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
                  {minimumMonthlyFee !== -1
                    ? formatCurrency(minimumMonthlyFee)
                    : "TBD"}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Minimum Interest Fee
                </Typography>
              </Box>
            </Box>
            <Box className={classes.box}>
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
                  {accountFees !== -1 ? formatCurrency(accountFees) : "TBD"}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Account Fees
                </Typography>
              </Box>
            </Box>
            <Box className={classes.box}>
              <Box display="flex" flexDirection="column">
                <Typography variant="h5">
                  {accountCredits !== -1
                    ? formatCurrency(accountCredits)
                    : "TBD"}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Account Credits
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box mt={6} />
        </>
      )}
    </Box>
  );
}

export default CustomerFinancialSummaryOverview;
