import {
  Box,
  createStyles,
  Divider,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import GaugeProgressBar from "components/Shared/ProgressBar/GaugeProgressBar";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  FinancialSummaryFragment,
  ProductTypeEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { customerRoutes } from "lib/routes";
import { round } from "lodash";
import { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const LinkText = styled.span`
  color: rgba(118, 147, 98, 1);
  font-size: 14px;
`;

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  financialSummary: FinancialSummaryFragment | null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "20%",
      paddingRight: 12,
    },
  })
);

export default function CustomerFinancialSummaryOverview({
  companyId,
  productType,
  financialSummary,
}: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const minimumFeePayload = financialSummary?.minimum_monthly_payload;

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

  const accountBalancePayload = financialSummary?.account_level_balance_payload;
  const accountFees =
    accountBalancePayload?.fees_total != null
      ? accountBalancePayload.fees_total
      : null;
  const accountCredits =
    accountBalancePayload?.credits_total != null
      ? accountBalancePayload.credits_total
      : null;

  const outstandingAmount = financialSummary
    ? financialSummary.adjusted_total_limit - financialSummary.available_limit
    : 0;
  const rawLimitPercent = financialSummary?.adjusted_total_limit
    ? (100 * outstandingAmount) / financialSummary.adjusted_total_limit
    : 100;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  const customerAccountFeesCreditsRoute = isBankUser
    ? `/customers/${companyId}/account`
    : customerRoutes.account;

  return (
    <Box display="flex" flexDirection="column" mt={2}>
      <Box display="flex" width="100%" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <Box display="flex">
            <Box display="flex" flexDirection="column" mb={6}>
              <Typography variant="h2">
                {financialSummary !== null
                  ? formatCurrency(financialSummary.total_outstanding_principal)
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
                {financialSummary !== null
                  ? formatCurrency(financialSummary.adjusted_total_limit)
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
                {financialSummary !== null
                  ? formatCurrency(financialSummary.available_limit)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Left to Borrow
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          <GaugeProgressBar value={roundedLimitPercent} />
        </Box>
      </Box>
      <Box mb={8}>
        <Divider />
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box className={classes.box}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h5">
              {financialSummary !== null
                ? formatCurrency(
                    Math.max(0.0, financialSummary.total_outstanding_interest)
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
              {financialSummary !== null
                ? formatCurrency(
                    Math.max(0.0, financialSummary.total_outstanding_fees)
                  )
                : "TBD"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Accrued Late Fees
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
              {formatCurrency(accountFees, "TBD")}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Accrued Account Fees
            </Typography>
            <Link
              to={customerAccountFeesCreditsRoute}
              style={{ textDecoration: "none" }}
            >
              <LinkText>View details</LinkText>
            </Link>
          </Box>
        </Box>
        <Box className={classes.box}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h5">
              {formatCurrency(accountCredits, "TBD")}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {`Holding Account Credits${
                productType === ProductTypeEnum.InvoiceFinancing
                  ? " (Excess Reserves)"
                  : ""
              }`}
            </Typography>
            <Link
              to={customerAccountFeesCreditsRoute}
              style={{ textDecoration: "none" }}
            >
              <LinkText>View details</LinkText>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
