import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { PaymentsInsertInput } from "generated/graphql";
import { formatDateString } from "lib/date";
import {
  PaymentOptionEnum,
  PaymentOptionToLabel,
  RepaymentMethodEnum,
  RepaymentMethodToLabel,
} from "lib/enum";
import { formatCurrency } from "lib/number";

interface Props {
  payment: PaymentsInsertInput;
}

export default function RequestedRepaymentPreview({ payment }: Props) {
  const paymentOption = payment.items_covered.payment_option;

  return (
    <Alert severity="info">
      <Box display="flex" flexDirection="column">
        <Box>
          <Typography variant="body1">
            {`Requested Repayment Method: ${
              RepaymentMethodToLabel[payment.method as RepaymentMethodEnum]
            }`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography variant="body1">
            {`Requested Deposit / Withdraw Date: ${formatDateString(
              payment.requested_payment_date
            )}`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography variant="body1">
            {`Requested Payment Option: ${
              PaymentOptionToLabel[paymentOption as PaymentOptionEnum]
            }`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography variant="body1">
            {`Requested Payment Amount: ${formatCurrency(
              payment.requested_amount
            )}`}
          </Typography>
          {!!(
            payment.items_covered.requested_to_principal ||
            payment.items_covered.requested_to_interest
          ) && (
            <>
              <Typography variant="subtitle2">
                {`- Requested Amount To Principal: ${formatCurrency(
                  payment.items_covered.requested_to_principal
                )}`}
              </Typography>
              <Typography variant="subtitle2">
                {`- Requested Amount To Interest: ${formatCurrency(
                  payment.items_covered.requested_to_interest
                )}`}
              </Typography>
            </>
          )}
          {!!payment.items_covered.requested_to_account_fees && (
            <Typography variant="subtitle2">
              {`- Requested Amount To Account Fees: ${formatCurrency(
                payment.items_covered.requested_to_account_fees
              )}`}
            </Typography>
          )}
        </Box>
      </Box>
    </Alert>
  );
}
