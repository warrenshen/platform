import { Box } from "@material-ui/core";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import { BeforeAfterPaymentLoan } from "lib/types";

interface Props {
  beforeAfterPaymentLoans: BeforeAfterPaymentLoan[];
}

function SettleRepaymentConfirmEffect({ beforeAfterPaymentLoans }: Props) {
  return (
    <Box>
      <Box>
        <LoansBeforeAfterPaymentPreview
          beforeAfterPaymentLoans={beforeAfterPaymentLoans}
        />
      </Box>
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
