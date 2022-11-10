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
  [LoanStatusEnum.Rejected]: "#ee95a1",
  past_due: "",
  closed: "",
  closing: "",
  archived: "",
};

const LoanStatusToLabel: { [key in LoanStatusEnum]: string } = {
  [LoanStatusEnum.Drafted]: "Not submitted yet",
  [LoanStatusEnum.ApprovalRequested]: "Financing pending approval",
  [LoanStatusEnum.Approved]: "Financing request approved",
  [LoanStatusEnum.Funded]: "Financing completed",
  [LoanStatusEnum.Rejected]: "Changes requested",
  past_due: "",
  closed: "",
  closing: "",
  archived: "",
};

export default function PurchaseOrderFinancingRequestStatusChipNew({
  loanStatus,
}: Props) {
  return (
    <StatusChip
      color={StatusToColor[loanStatus]}
      text={LoanStatusToLabel[loanStatus]}
    />
  );
}
