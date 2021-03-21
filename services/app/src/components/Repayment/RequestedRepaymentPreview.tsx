import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { PaymentsInsertInput } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";

interface Props {
  payment: PaymentsInsertInput;
}

function RequestedRepaymentPreview({ payment }: Props) {
  return (
    <Alert severity="info">
      <Box display="flex" flexDirection="column">
        <Box>
          <Typography variant="body1">
            {`Payment Method: ${
              PaymentMethodToLabel[payment.method as PaymentMethodEnum]
            }`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography variant="body1">
            {`Requested Payment Date: ${formatDateString(
              payment.requested_payment_date
            )}`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography variant="body1">
            {`Requested Payment Amount: ${formatCurrency(
              payment.requested_amount
            )}`}
          </Typography>
          {(payment.items_covered.requested_to_principal ||
            payment.items_covered.requested_to_interest) && (
            <>
              <Typography variant="subtitle2">
                {`Amount to Principal: ${formatCurrency(
                  payment.items_covered.requested_to_principal
                )}`}
              </Typography>
              <Typography variant="subtitle2">
                {`Amount to Interest: ${formatCurrency(
                  payment.items_covered.requested_to_interest
                )}`}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Alert>
  );
}

export default RequestedRepaymentPreview;
