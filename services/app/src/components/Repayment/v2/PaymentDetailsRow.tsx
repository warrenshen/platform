import { Box } from "@material-ui/core";
import VerticalValueAndLabel from "components/Repayment/v2/VerticalValueAndLabel";
import { formatCurrency } from "lib/number";

interface Props {
  depositDate: string;
  repaymentMethod: string;
  repaymentAmount: number;
  amountFromHoldingAccount: number;
}

const PaymentDetailsRow = ({
  depositDate,
  repaymentMethod,
  repaymentAmount,
  amountFromHoldingAccount,
}: Props) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <VerticalValueAndLabel value={depositDate} label="Deposit date" />
      <VerticalValueAndLabel value={repaymentMethod} label="Repayment method" />
      <VerticalValueAndLabel
        value={formatCurrency(repaymentAmount)}
        label="Repayment method"
      />
      <VerticalValueAndLabel
        value={formatCurrency(amountFromHoldingAccount)}
        label="Repayment method"
      />
    </Box>
  );
};

export default PaymentDetailsRow;
