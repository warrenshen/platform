import { Box } from "@material-ui/core";
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

/**
 * The <Box> wrapper is necessary, otherwise sometimes our
 * DataGrid library (provided by dev-extreme) may throw the following error:
 * Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
 */
function RequestStatusChip({ requestStatus }: Props) {
  return (
    <Box>
      <Chip
        color={"white"}
        background={StatusToColor[requestStatus]}
        label={RequestStatusToLabel[requestStatus]}
      ></Chip>
    </Box>
  );
}

export default RequestStatusChip;
