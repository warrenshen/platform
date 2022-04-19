import { Typography } from "@material-ui/core";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
} from "lib/enum";
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
  requestStatus: DebtFacilityCompanyStatusEnum;
}

const StatusToColor = {
  [DebtFacilityCompanyStatusEnum.GOOD_STANDING]: "rgba(118, 147, 98, 1)", // Gray
  [DebtFacilityCompanyStatusEnum.ON_PROBATION]: "#f1c40f", // Yellow
  [DebtFacilityCompanyStatusEnum.OUT_OF_COMPLIANCE]: "red",
  [DebtFacilityCompanyStatusEnum.DEFAULTING]: "red",
  [DebtFacilityCompanyStatusEnum.INELIGIBLE_FOR_FACILITY]: "red",
  [DebtFacilityCompanyStatusEnum.WAIVER]: "red",
};

const EbbaApplicationClientSurveillanceStatusChip = ({
  requestStatus,
}: Props) => (
  <Chip backgroundColor={StatusToColor[requestStatus]}>
    <Text>{DebtFacilityCompanyStatusToLabel[requestStatus]}</Text>
  </Chip>
);

export default EbbaApplicationClientSurveillanceStatusChip;
