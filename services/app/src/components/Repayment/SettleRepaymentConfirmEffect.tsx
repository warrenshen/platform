import { Box, Typography } from "@material-ui/core";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import { Loans } from "generated/graphql";
import { LoanBeforeAfterPayment } from "lib/types";

interface Props {
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  setLoanBeforeAfterPayment: (
    loanId: Loans["id"],
    field: string,
    value: number
  ) => void;
}

function SettleRepaymentConfirmEffect({
  loansBeforeAfterPayment,
  setLoanBeforeAfterPayment,
}: Props) {
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
          isSettlePayment
          loansBeforeAfterPayment={loansBeforeAfterPayment}
          setLoanBeforeAfterPayment={setLoanBeforeAfterPayment}
        />
      </Box>
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
