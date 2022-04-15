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
  [DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY]: "#769362", // Bespoke's green
  [DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET]: "#cba679", // Bespoke's gold/brown
  [DebtFacilityStatusEnum.REPURCHASED]: "#cba679", // Bespoke's gold/brown
  [DebtFacilityStatusEnum.UPDATE_REQUIRED]: "#ff9999", // pink
  [DebtFacilityStatusEnum.WAIVER]: "#769362", // Bespoke's green
};

export default function DebtFacilityStatusChip({ debtFacilityStatus }: Props) {
  if (
    debtFacilityStatus.toString() ===
    DebtFacilityCompanyStatusEnum.WAIVER.toString()
  ) {
    debtFacilityStatus = DebtFacilityStatusEnum.WAIVER;
  }

  return (
    <Box height={33}>
      <Chip
        backgroundColor={
          StatusToColor[
            [
              DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY,
              DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET,
              DebtFacilityStatusEnum.REPURCHASED,
              DebtFacilityStatusEnum.UPDATE_REQUIRED,
              DebtFacilityStatusEnum.WAIVER,
            ].includes(debtFacilityStatus)
              ? debtFacilityStatus
              : "Default"
          ]
        }
      >
        <Text>
          {[
            DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY,
            DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET,
            DebtFacilityStatusEnum.REPURCHASED,
            DebtFacilityStatusEnum.UPDATE_REQUIRED,
            DebtFacilityStatusEnum.WAIVER,
          ].includes(debtFacilityStatus)
            ? DebtFacilityStatusToLabel[debtFacilityStatus]
            : "No Debt Facility Status"}
        </Text>
      </Chip>
    </Box>
  );
}
