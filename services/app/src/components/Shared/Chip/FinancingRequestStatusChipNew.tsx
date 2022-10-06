import StatusChip from "components/Shared/Chip/StatusChip";
import { LoanStatusEnum } from "lib/enum";

interface Props {
  loanStatus: LoanStatusEnum;
}

const StatusToColor: { [key in LoanStatusEnum]: string } = {
  [LoanStatusEnum.Drafted]: "#327e9e",
  [LoanStatusEnum.ApprovalRequested]: "#cf8937",
  [LoanStatusEnum.Approved]: "#7dcb9d",
  [LoanStatusEnum.Funded]: "#594ca4",
  rejected: "",
  past_due: "",
  closed: "",
  closing: "",
};

const LoanStatusToLabel: { [key in LoanStatusEnum]: string } = {
  [LoanStatusEnum.Drafted]: "Not submitted yet",
  [LoanStatusEnum.ApprovalRequested]: "Financing pending approval",
  [LoanStatusEnum.Approved]: "Financing request approved",
  [LoanStatusEnum.Funded]: "Financing completed",
  rejected: "",
  past_due: "",
  closed: "",
  closing: "",
};

export default function FinancingRequestStatusChipNew({ loanStatus }: Props) {
  return (
    <StatusChip
      color={StatusToColor[loanStatus]}
      text={LoanStatusToLabel[loanStatus]}
    />
  );
}
