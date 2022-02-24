import { Box, Typography } from "@material-ui/core";
import GaugeProgressBar from "components/Shared/ProgressBar/GaugeProgressBar";
import { formatCurrency } from "lib/number";
import { round } from "lodash";

interface Props {
  currentUsage: number;
  maxCapacity: number;
}

function DebtFacilityCapacitySummary(props: Props) {
  const rawLimitPercent =
    !!props.maxCapacity && props.maxCapacity !== 0
      ? (100 * props.currentUsage) / props.maxCapacity
      : 0;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  return (
    <Box
      display="flex"
      flexDirection="row"
      height="50px"
      justifyContent="space-between"
    >
      <Box flex="1" flexDirection="row" alignItems="flext-start">
        <Typography variant="h5" color="textSecondary">
          {`${formatCurrency(props.currentUsage)} / ${formatCurrency(
            props.maxCapacity
          )}`}
        </Typography>
      </Box>
      <Box
        flexDirection="row"
        alignItems="flex-end"
        style={{
          position: "relative",
          top: "-80px",
        }}
      >
        <GaugeProgressBar
          value={roundedLimitPercent}
          valueFontSize={20}
          caption={"Capacity Usage"}
          circleSize={200}
        />
      </Box>
    </Box>
  );
}

export default DebtFacilityCapacitySummary;
