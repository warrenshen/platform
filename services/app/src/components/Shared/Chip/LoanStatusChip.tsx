import StatusChip from "components/Shared/Chip/StatusChip";
import { LoanStatusEnum, LoanStatusToLabel } from "lib/enum";

interface Props {
  loanStatus: LoanStatusEnum;
}

const StatusToColor = {
  [LoanStatusEnum.Drafted]: "#bdc3c7", // Gray
  [LoanStatusEnum.ApprovalRequested]: "#f1c40f", // Yellow
  [LoanStatusEnum.Approved]: "#2ecc71", // Green
  [LoanStatusEnum.Rejected]: "#e67e22", // Orange
  [LoanStatusEnum.PastDue]: "#e74c3c", // Red
  [LoanStatusEnum.Funded]: "#3498db", // Blue
  [LoanStatusEnum.Closed]: "#9b59b6", // Purple
  [LoanStatusEnum.Closing]: "#9b59b6",
};

export default function LoanStatusChip({ loanStatus }: Props) {
  return (
    <>
      {!!loanStatus && (
        <StatusChip
          color={StatusToColor[loanStatus]}
          text={LoanStatusToLabel[loanStatus]}
        />
      )}
    </>
  );
}
