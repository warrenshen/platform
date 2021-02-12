import Chip from "components/Shared/Chip";
import { RequestStatusEnum } from "generated/graphql";
import { RequestStatusToLabel } from "lib/enum";

interface Props {
  requestStatus: RequestStatusEnum;
}

const StatusToColor = {
  [RequestStatusEnum.Drafted]: "#bdc3c7", // Gray
  [RequestStatusEnum.ApprovalRequested]: "#f1c40f", // Yellow
  [RequestStatusEnum.Approved]: "#2ecc71", // Green
  [RequestStatusEnum.Rejected]: "#e67e22", // Orange
};

function RequestStatusChip({ requestStatus }: Props) {
  return (
    <Chip
      color={"white"}
      background={StatusToColor[requestStatus]}
      label={RequestStatusToLabel[requestStatus]}
    ></Chip>
  );
}

export default RequestStatusChip;
