import { Box } from "@material-ui/core";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import { LoanBeforeAfterPayment } from "lib/types";

interface Props {
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
}

function SettleRepaymentConfirmEffect({ loansBeforeAfterPayment }: Props) {
  return (
    <Box>
      <Box>
        <LoansBeforeAfterPaymentPreview
          loansBeforeAfterPayment={loansBeforeAfterPayment}
        />
      </Box>
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
