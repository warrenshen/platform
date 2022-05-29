import { Typography } from "@material-ui/core";
import { SurveillanceStatusEnum, SurveillanceStatusToLabel } from "lib/enum";
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
  requestStatus: SurveillanceStatusEnum;
}

const StatusToColor = {
  [SurveillanceStatusEnum.GoodStanding]: "rgb(118, 147, 98)", // Gray
  [SurveillanceStatusEnum.OnProbation]: "rgb(241, 196, 15)", // Yellow
  [SurveillanceStatusEnum.OnPause]: "rgb(230, 126, 34)", // Orange,
  [SurveillanceStatusEnum.Defaulted]: "rgb(230, 126, 34)", // Orange,
  [SurveillanceStatusEnum.Onboarding]: "rgb(25, 113, 194)", // Blue,
  [SurveillanceStatusEnum.Inactive]: "rgb(189, 195, 199)", // Grey,
  [SurveillanceStatusEnum.InReview]: "rgb(241, 196, 15)", // Yellow
};

const ClientSurveillanceStatusChip = ({ requestStatus }: Props) => (
  <Chip backgroundColor={StatusToColor[requestStatus]}>
    <Text>{SurveillanceStatusToLabel[requestStatus] || "-"}</Text>
  </Chip>
);

export default ClientSurveillanceStatusChip;
