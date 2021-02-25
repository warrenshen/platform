import { Box } from "@material-ui/core";
import Chip from "components/Shared/Chip";
import { PaymentStatusEnum, PaymentStatusToLabel } from "lib/enum";

interface Props {
  paymentStatus: PaymentStatusEnum;
}

const StatusToColor = {
  [PaymentStatusEnum.PARTIALLY_PAID]: "#f1c40f", // Yellow
  [PaymentStatusEnum.PENDING]: "#3498db", // Blue
  [PaymentStatusEnum.SCHEDULED]: "#3498db", // Blue
  [PaymentStatusEnum.CLOSED]: "#2ecc71", // Purple
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
