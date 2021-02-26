import { Box } from "@material-ui/core";
import Chip from "components/Shared/Chip";
import { PaymentStatusEnum, PaymentStatusToLabel } from "lib/enum";

interface Props {
  paymentStatus: PaymentStatusEnum;
}

const StatusToColor = {
  [PaymentStatusEnum.PARTIALLY_PAID]: "#e67e22", // Orange
  [PaymentStatusEnum.PENDING]: "#f1c40f", // Yellow
  [PaymentStatusEnum.SCHEDULED]: "#f1c40f", // Yellow
  [PaymentStatusEnum.CLOSED]: "#9b59b6", // Purple
};

function PaymentStatusChip({ paymentStatus }: Props) {
  return (
    <Box>
      {paymentStatus && (
        <Chip
          color={"white"}
          background={StatusToColor[paymentStatus]}
          label={PaymentStatusToLabel[paymentStatus]}
        ></Chip>
      )}
    </Box>
  );
}

export default PaymentStatusChip;
