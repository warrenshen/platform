import StatusChip from "components/Shared/Chip/StatusChip";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
} from "lib/enum";

interface Props {
  debtFacilityCompanyStatus: DebtFacilityCompanyStatusEnum;
}

const StatusToColor = {
  [DebtFacilityCompanyStatusEnum.Eligible]: "#769362", // Bespoke's green
  [DebtFacilityCompanyStatusEnum.Ineligible]: "#ff9999", // Bespoke's gold/brown
  [DebtFacilityCompanyStatusEnum.Waiver]: "#939393", // pink
  [DebtFacilityCompanyStatusEnum.PendingWaiver]: "#cba679", // pink
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
