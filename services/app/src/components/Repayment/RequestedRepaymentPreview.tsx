import { Box, Typography } from "@material-ui/core";
import { PaymentsInsertInput } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";

interface Props {
  payment: PaymentsInsertInput;
}

function RequestedRepaymentPreview({ payment }: Props) {
  return (
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
          {`Requested Payment Amount: ${formatCurrency(payment.amount)}`}
        </Typography>
        {(payment.items_covered.to_principal ||
          payment.items_covered.to_interest) && (
          <Typography variant="subtitle2">
            {`Requested Breakdown:\nPrincipal: ${formatCurrency(
              payment.items_covered.to_principal
            )}\nInterest: ${formatCurrency(payment.items_covered.to_interest)}`}
          </Typography>
        )}
      </Box>
      <Box mt={1}>
        <Typography variant="body1">
          {`Requested Payment Date: ${formatDateString(
            payment.requested_payment_date
          )}`}
        </Typography>
      </Box>
    </Box>
  );
}

export default RequestedRepaymentPreview;
