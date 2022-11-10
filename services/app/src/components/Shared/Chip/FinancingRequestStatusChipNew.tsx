import StatusChip from "components/Shared/Chip/StatusChip";
import { LoanStatusEnum } from "lib/enum";

interface Props {
  loanStatus: LoanStatusEnum;
}

const StatusToColor: { [key in LoanStatusEnum]: string } = {
  [LoanStatusEnum.Drafted]: "#939393",
  [LoanStatusEnum.ApprovalRequested]: "#ffc96b",
  [LoanStatusEnum.Approved]: "#7dcb9d",
  [LoanStatusEnum.Funded]: "#594ca4",
  [LoanStatusEnum.Rejected]: "#ee95a1",
  past_due: "",
  closed: "",
  closing: "",
  archived: "",
};

const LoanStatusToLabel: { [key in LoanStatusEnum]: string } = {
  [LoanStatusEnum.Drafted]: "Draft",
  [LoanStatusEnum.ApprovalRequested]: "Pending approval",
  [LoanStatusEnum.Approved]: "Approved",
  [LoanStatusEnum.Funded]: "Financing completed",
  [LoanStatusEnum.Rejected]: "Changes required for approval",
  past_due: "",
  closed: "",
  closing: "",
  archived: "",
};

export default function FinancingRequestStatusChipNew({ loanStatus }: Props) {
  return (
    <StatusChip
      color={StatusToColor[loanStatus]}
      text={LoanStatusToLabel[loanStatus]}
    />
  );
}
