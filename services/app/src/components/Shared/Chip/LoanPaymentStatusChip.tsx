import StatusChip from "components/Shared/Chip/StatusChip";
import { LoanPaymentStatusEnum, LoanPaymentStatusToLabel } from "lib/enum";

interface Props {
  paymentStatus: LoanPaymentStatusEnum;
}

const StatusToColor = {
  [LoanPaymentStatusEnum.NoPayment]: "#3498db", // Blue,
  [LoanPaymentStatusEnum.PartiallyPaid]: "#ee95a1", // Pink
  [LoanPaymentStatusEnum.Pending]: "#ffc96b", // Yellow
  [LoanPaymentStatusEnum.Scheduled]: "#cf8937", // Orange
  [LoanPaymentStatusEnum.Closing]: "#7dcb9d", // Sea Foam Green
  [LoanPaymentStatusEnum.Closed]: "#594ca4", // Purple
};

export default function LoanPaymentStatusChip({ paymentStatus }: Props) {
  if (!paymentStatus) {
    paymentStatus = LoanPaymentStatusEnum.NoPayment;
  }

  return (
    <>
      {!!paymentStatus && (
        <StatusChip
          color={StatusToColor[paymentStatus]}
          text={LoanPaymentStatusToLabel[paymentStatus]}
        />
      )}
    </>
  );
}
