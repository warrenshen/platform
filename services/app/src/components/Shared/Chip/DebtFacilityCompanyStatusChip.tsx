import StatusChip from "components/Shared/Chip/StatusChip";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
} from "lib/enum";

interface Props {
  debtFacilityCompanyStatus: DebtFacilityCompanyStatusEnum;
}

const StatusToColor = {
  [DebtFacilityCompanyStatusEnum.GoodStanding]: "#769362", // Bespoke's green
  [DebtFacilityCompanyStatusEnum.OnProbation]: "#cba679", // Bespoke's gold/brown
  [DebtFacilityCompanyStatusEnum.OutOfCompliance]: "#ff9999", // pink
  [DebtFacilityCompanyStatusEnum.Defaulting]: "#ff9999", // pink
  [DebtFacilityCompanyStatusEnum.IneligibleForFacility]: "#939393", // gray
  [DebtFacilityCompanyStatusEnum.Waiver]: "#939393", // gray
};

export default function DebtFacilityCompanyStatusChip({
  debtFacilityCompanyStatus,
}: Props) {
  return (
    <>
      {!!debtFacilityCompanyStatus && (
        <StatusChip
          color={StatusToColor[debtFacilityCompanyStatus]}
          text={DebtFacilityCompanyStatusToLabel[debtFacilityCompanyStatus]}
        />
      )}
    </>
  );
}
