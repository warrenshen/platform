import StatusChip from "components/Shared/Chip/StatusChip";
import { RequestStatusEnum } from "generated/graphql";
import { RequestStatusToLabel } from "lib/enum";

interface Props {
  requestStatus: RequestStatusEnum;
}

const StatusToColor = {
  [RequestStatusEnum.Drafted]: "#bdc3c7", // Gray
  [RequestStatusEnum.ApprovalRequested]: "#f1c40f", // Yellow
  [RequestStatusEnum.Incomplete]: "#e67e22", // Orange
  [RequestStatusEnum.Approved]: "rgba(118, 147, 98, 1)", // Green
  [RequestStatusEnum.Rejected]: "#e67e22", // Orange
};

export default function RequestStatusChip({ requestStatus }: Props) {
  return (
    <>
      {!!requestStatus && (
        <StatusChip
          color={StatusToColor[requestStatus]}
          text={RequestStatusToLabel[requestStatus]}
        />
      )}
    </>
  );
}
