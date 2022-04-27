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
  [BankStatusEnum.GOOD_STANDING]: "rgba(118, 147, 98, 1)", // Gray
  [BankStatusEnum.ON_PROBATION]: "#f1c40f", // Yellow
  [BankStatusEnum.ON_PAUSE]: "#e74c3c", // Red,
  [BankStatusEnum.DEFAULTED]: "#e74c3c", // Red,
  [BankStatusEnum.ONBOARDING]: "#e74c3c", // Red,
  [BankStatusEnum.INACTIVE]: "#e74c3c", // Red,
};

const ClientSurveillanceStatusChip = ({ requestStatus }: Props) => (
  <Chip backgroundColor={StatusToColor[requestStatus]}>
    <Text>{BankStatusToLabel[requestStatus] || "-"}</Text>
  </Chip>
);

export default ClientSurveillanceStatusChip;
