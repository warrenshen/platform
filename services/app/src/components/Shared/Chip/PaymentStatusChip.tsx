import { Box } from "@material-ui/core";
import Chip from "components/Shared/Chip";
import { LoanStatusEnum } from "generated/graphql";
import { PaymentStatusEnum, PaymentStatusToLabel } from "lib/enum";

interface Props {
  paymentStatus: PaymentStatusEnum;
}

const StatusToColor = {
  [LoanStatusEnum.Funded]: "#3498db", // Blue,
  [PaymentStatusEnum.PARTIALLY_PAID]: "#e67e22", // Orange
  [PaymentStatusEnum.PENDING]: "#f1c40f", // Yellow
  [PaymentStatusEnum.SCHEDULED]: "#f1c40f", // Yellow
  [PaymentStatusEnum.CLOSED]: "#9b59b6", // Purple
};

function PaymentStatusChip({ paymentStatus }: Props) {
  return (
    <Box>
      <Chip
        color={"white"}
        background={
          StatusToColor[
            [
              PaymentStatusEnum.PARTIALLY_PAID,
              PaymentStatusEnum.PENDING,
              PaymentStatusEnum.SCHEDULED,
              PaymentStatusEnum.CLOSED,
            ].includes(paymentStatus)
              ? paymentStatus
              : LoanStatusEnum.Funded
          ]
        }
        label={
          [
            PaymentStatusEnum.PARTIALLY_PAID,
            PaymentStatusEnum.PENDING,
            PaymentStatusEnum.SCHEDULED,
            PaymentStatusEnum.CLOSED,
          ].includes(paymentStatus)
            ? PaymentStatusToLabel[paymentStatus]
            : "No Payment"
        }
      />
    </Box>
  );
}

export default PaymentStatusChip;
