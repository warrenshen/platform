import { Box } from "@material-ui/core";
import VerticalValueAndLabel from "components/Repayment/v2/VerticalValueAndLabel";
import { formatDateString } from "lib/date";
import { RepaymentMethodEnum, RepaymentMethodToLabel } from "lib/enum";
import { formatCurrency } from "lib/number";

interface Props {
  depositDate: string;
  repaymentMethod: RepaymentMethodEnum;
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
      <VerticalValueAndLabel
        value={formatDateString(depositDate) || ""}
        label="Deposit date"
      />
      <VerticalValueAndLabel
        value={RepaymentMethodToLabel[repaymentMethod]}
        label="Repayment method"
      />
      <VerticalValueAndLabel
        value={formatCurrency(repaymentAmount - amountFromHoldingAccount)}
        label="Amount from repayment method"
      />
      <VerticalValueAndLabel
        value={formatCurrency(amountFromHoldingAccount)}
        label="Amount from holding account"
      />
    </Box>
  );
};

export default PaymentDetailsRow;
