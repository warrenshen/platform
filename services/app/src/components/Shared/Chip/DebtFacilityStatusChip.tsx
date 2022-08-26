import StatusChip from "components/Shared/Chip/StatusChip";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityStatusEnum,
  DebtFacilityStatusToLabel,
} from "lib/enum";

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
    <>
      {!!debtFacilityStatus && (
        <StatusChip
          color={StatusToColor[debtFacilityStatus]}
          text={DebtFacilityStatusToLabel[debtFacilityStatus]}
        />
      )}
    </>
  );
}
