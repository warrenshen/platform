import { Typography } from "@material-ui/core";
import { BankStatusEnum, BankStatusToLabel } from "lib/enum";
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
  requestStatus: BankStatusEnum;
}

const StatusToColor = {
  [BankStatusEnum.GOOD_STANDING]: "rgb(118, 147, 98)", // Gray
  [BankStatusEnum.ON_PROBATION]: "rgb(241, 196, 15)", // Yellow
  [BankStatusEnum.ON_PAUSE]: "rgb(230, 126, 34)", // Orange,
  [BankStatusEnum.DEFAULTED]: "rgb(230, 126, 34)", // Orange,
  [BankStatusEnum.ONBOARDING]: "rgb(25, 113, 194)", // Blue,
  [BankStatusEnum.INACTIVE]: "rgb(189, 195, 199)", // Grey,
};

const ClientSurveillanceStatusChip = ({ requestStatus }: Props) => (
  <Chip backgroundColor={StatusToColor[requestStatus]}>
    <Text>{BankStatusToLabel[requestStatus] || "-"}</Text>
  </Chip>
);

export default ClientSurveillanceStatusChip;
