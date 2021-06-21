import { Box, Tooltip, withStyles } from "@material-ui/core";
import LinearProgressBar from "components/Shared/ProgressBar/LinearProgressBar";
import { round } from "lodash";

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    maxWidth: 220,
    textAlign: "center",
    fontSize: theme.typography.pxToRem(14),
  },
}))(Tooltip);

interface Props {
  percentValue: number;
  tooltipLabel?: string;
}

export default function ProgressBarDataGridCell({
  percentValue,
  tooltipLabel,
}: Props) {
  const roundedPercentValue = round(percentValue, 2);
  return (
    <HtmlTooltip
      arrow
      interactive
      title={
        tooltipLabel
          ? `${tooltipLabel} (${roundedPercentValue}%)`
          : `${roundedPercentValue}%`
      }
    >
      <Box display="flex" alignItems="center" py={1}>
        <LinearProgressBar value={roundedPercentValue} />
      </Box>
    </HtmlTooltip>
  );
}
