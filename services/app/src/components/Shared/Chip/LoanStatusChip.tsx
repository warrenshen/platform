import { Box } from "@material-ui/core";
import Chip from "components/Shared/Chip";
import { LoanStatusEnum } from "generated/graphql";
import { LoanStatusToLabel } from "lib/enum";

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
};

function LoanStatusChip({ loanStatus }: Props) {
  return (
    <Box>
      <Chip
        color={"white"}
        background={StatusToColor[loanStatus]}
        label={LoanStatusToLabel[loanStatus]}
      ></Chip>
    </Box>
  );
}

export default LoanStatusChip;
