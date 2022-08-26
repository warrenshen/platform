import StatusChip from "components/Shared/Chip/StatusChip";
import { SurveillanceStatusEnum, SurveillanceStatusToLabel } from "lib/enum";

interface Props {
  surveillanceStatus: SurveillanceStatusEnum;
}

const StatusToColor = {
  Default: "#bdc3c7", // Gray,
  [SurveillanceStatusEnum.GoodStanding]: "rgb(118, 147, 98)", // Gray
  [SurveillanceStatusEnum.OnProbation]: "rgb(241, 196, 15)", // Yellow
  [SurveillanceStatusEnum.OnPause]: "rgb(230, 126, 34)", // Orange,
  [SurveillanceStatusEnum.Defaulted]: "rgb(230, 126, 34)", // Orange,
  [SurveillanceStatusEnum.Onboarding]: "rgb(25, 113, 194)", // Blue,
  [SurveillanceStatusEnum.Inactive]: "rgb(189, 195, 199)", // Grey,
  [SurveillanceStatusEnum.InReview]: "rgb(241, 196, 15)", // Yellow
};

export default function CustomerSurveillanceStatusChip({
  surveillanceStatus,
}: Props) {
  return (
    <>
      {!!surveillanceStatus && (
        <StatusChip
          color={StatusToColor[surveillanceStatus]}
          text={SurveillanceStatusToLabel[surveillanceStatus]}
        />
      )}
    </>
  );
}
