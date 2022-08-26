import StatusChip from "components/Shared/Chip/StatusChip";
import { LoanPaymentStatusEnum, LoanPaymentStatusToLabel } from "lib/enum";

interface Props {
  paymentStatus: LoanPaymentStatusEnum;
}

const StatusToColor = {
  [LoanPaymentStatusEnum.NoPayment]: "#3498db", // Blue,
  [LoanPaymentStatusEnum.PartiallyPaid]: "#e67e22", // Orange
  [LoanPaymentStatusEnum.Pending]: "#f1c40f", // Yellow
  [LoanPaymentStatusEnum.Scheduled]: "#f1c40f", // Yellow
  [LoanPaymentStatusEnum.Closed]: "#9b59b6", // Purple
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
