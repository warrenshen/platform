import { Typography } from "@material-ui/core";
import { RequestStatusEnum } from "generated/graphql";
import { RequestStatusToLabel } from "lib/enum";
import styled from "styled-components";

const Chip = styled.div<{ backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: 150px;
  padding: 6px 0px;
  border-radius: 18px;
  background-color: ${(props) => props.backgroundColor};
  color: white;
`;

const Text = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
`;

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
    <Chip backgroundColor={StatusToColor[requestStatus]}>
      <Text>{RequestStatusToLabel[requestStatus]}</Text>
    </Chip>
  );
}
