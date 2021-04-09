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
  financialSummary: FinancialSummaryFragment | null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "20%",
    },
  })
);

function CustomerFinancialSummaryOverview({ financialSummary }: Props) {
  const classes = useStyles();

  const minimumFeePayload = financialSummary?.minimum_monthly_payload;
  const accountBalancePayload = financialSummary?.account_level_balance_payload;

  let minimumFee = -1;
  let feeDuration = "";

  if (minimumFeePayload && Object.keys(minimumFeePayload).length > 0) {
    // Three keys you can read from:
    // amount_short: How much you will be charged extra for not using the product enough
    // minimum_amount: What is the minimum required revenue Bespoke gets from interest.
    // amount_accrued: How much you will pay this month in interest
    // duration: e.g., monthly, quarterly, annually
    minimumFee = minimumFeePayload.amount_short;
    const duration = minimumFeePayload.duration;

    if (duration && duration.length > 0) {
      feeDuration =
        minimumFeePayload.duration.charAt(0).toUpperCase() +
        minimumFeePayload.duration.slice(1);
    }
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
          <Box display="flex">
            <Box
              display="flex"
              flexDirection="column"
              flex={1}
              minWidth={"200px"}
            >
              <Typography variant="h5">
                {financialSummary
                  ? formatCurrency(financialSummary?.adjusted_total_limit)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Borrowing Limit
              </Typography>
            </Box>
            <Box mr={6} />
            <Box
              display="flex"
              flexDirection="column"
              flex={1}
              minWidth={"200px"}
            >
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
                ? formatCurrency(financialSummary?.total_outstanding_interest)
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
              {minimumFee !== -1 ? formatCurrency(minimumFee) : "TBD"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Minimum Interest Fee
              {minimumFee !== -1 ? " Due " + feeDuration : ""}
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
              {accountCredits !== -1 ? formatCurrency(accountCredits) : "TBD"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Account Credits
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerFinancialSummaryOverview;
