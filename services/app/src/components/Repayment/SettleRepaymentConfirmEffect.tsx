import { Box, Typography } from "@material-ui/core";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import { LoanBeforeAfterPayment } from "lib/types";

interface Props {
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
}

function SettleRepaymentConfirmEffect({ loansBeforeAfterPayment }: Props) {
  return (
    <Box>
      <Box>
        <Typography>
          Step 2 of 2: Review expected effect of payment, in the form of
          balances of loans before vs balances of loans after payment, specify
          payment information, and submit payment.
        </Typography>
      </Box>
      <Box mt={2}>
        <LoansBeforeAfterPaymentPreview
          loansBeforeAfterPayment={loansBeforeAfterPayment}
        />
      </Box>
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
