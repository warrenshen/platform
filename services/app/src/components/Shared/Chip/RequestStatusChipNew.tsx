import { Typography } from "@material-ui/core";
import { RequestStatusEnum } from "generated/graphql";
import { RequestStatusToLabel } from "lib/enum";
import styled from "styled-components";

const Chip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: fit-content;
  max-height: 30px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: #f6f5f3;
  color: #2c2a27;
`;

const Text = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
  line-height: 133.3%;
`;

const Dot = styled.div<{ $dotColor: string }>`
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.$dotColor};
  border-radius: 24px;
  margin: 0 11px 0 0;
`;

interface Props {
  requestStatus: RequestStatusEnum;
}

const StatusToColor = {
  [RequestStatusEnum.Drafted]: "#594ca4", // Blue
  [RequestStatusEnum.ApprovalRequested]: "#cf8937", // Sand
  [RequestStatusEnum.Approved]: "#7dcb9d", // Seafoam Green
  [RequestStatusEnum.Incomplete]: "#939393", // Gray
  [RequestStatusEnum.Rejected]: "#a4453f", // Red
};

export default function RequestStatusChipNew({ requestStatus }: Props) {
  return (
    <Chip>
      <Dot $dotColor={StatusToColor[requestStatus]}></Dot>
      <Text>{RequestStatusToLabel[requestStatus]}</Text>
    </Chip>
  );
}
