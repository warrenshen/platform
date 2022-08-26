import StatusChip from "components/Shared/Chip/StatusChip";
import { PaymentStatusEnum, PaymentStatusToLabel } from "lib/enum";

interface Props {
  paymentStatus: PaymentStatusEnum;
}

const StatusToColor = {
  [PaymentStatusEnum.AwaitingSubmit]: "#e67e22", // Orange
  [PaymentStatusEnum.AwaitingSettlement]: "#f1c40f", // Yellow
  [PaymentStatusEnum.Settled]: "#2ecc71", // Green
  [PaymentStatusEnum.Reversed]: "#e74c3c", // Red
  [PaymentStatusEnum.Deleted]: "#bdc3c7", // Gray
};

export default function PaymentStatusChip({ paymentStatus }: Props) {
  return (
    <>
      {!!paymentStatus && (
        <StatusChip
          color={StatusToColor[paymentStatus]}
          text={PaymentStatusToLabel[paymentStatus]}
        />
      )}
    </>
  );
}
