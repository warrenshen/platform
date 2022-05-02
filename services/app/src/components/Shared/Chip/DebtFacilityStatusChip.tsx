import { Box, Typography } from "@material-ui/core";
import {
  DebtFacilityStatusEnum,
  DebtFacilityStatusToLabel,
  DebtFacilityCompanyStatusEnum,
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
  debtFacilityStatus: DebtFacilityStatusEnum;
}

const StatusToColor = {
  Default: "#3498db", // Blue,
  [DebtFacilityStatusEnum.SoldIntoDebtFacility]: "#769362", // Bespoke's green
  [DebtFacilityStatusEnum.BespokeBalanceSheet]: "#cba679", // Bespoke's gold/brown
  [DebtFacilityStatusEnum.Repurchased]: "#cba679", // Bespoke's gold/brown
  [DebtFacilityStatusEnum.UpdateRequired]: "#ff9999", // pink
  [DebtFacilityStatusEnum.Waiver]: "#769362", // Bespoke's green
};

export default function DebtFacilityStatusChip({ debtFacilityStatus }: Props) {
  if (
    debtFacilityStatus.toString() ===
    DebtFacilityCompanyStatusEnum.Waiver.toString()
  ) {
    debtFacilityStatus = DebtFacilityStatusEnum.Waiver;
  }

  return (
    <Box height={33}>
      <Chip
        backgroundColor={
          StatusToColor[
            [
              DebtFacilityStatusEnum.SoldIntoDebtFacility,
              DebtFacilityStatusEnum.BespokeBalanceSheet,
              DebtFacilityStatusEnum.Repurchased,
              DebtFacilityStatusEnum.UpdateRequired,
              DebtFacilityStatusEnum.Waiver,
            ].includes(debtFacilityStatus)
              ? debtFacilityStatus
              : "Default"
          ]
        }
      >
        <Text>
          {[
            DebtFacilityStatusEnum.SoldIntoDebtFacility,
            DebtFacilityStatusEnum.BespokeBalanceSheet,
            DebtFacilityStatusEnum.Repurchased,
            DebtFacilityStatusEnum.UpdateRequired,
            DebtFacilityStatusEnum.Waiver,
          ].includes(debtFacilityStatus)
            ? DebtFacilityStatusToLabel[debtFacilityStatus]
            : "No Debt Facility Status"}
        </Text>
      </Chip>
    </Box>
  );
}
