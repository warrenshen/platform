import { Box, Typography } from "@material-ui/core";
import GaugeProgressBar from "components/Shared/ProgressBar/GaugeProgressBar";
import { FinancialSummaryFragment } from "generated/graphql";
import { formatCurrency } from "lib/number";
import { round } from "lodash";

interface Props {
  financialSummary: FinancialSummaryFragment | null;
}

export default function CustomerFinancialSummaryPreview({
  financialSummary,
}: Props) {
  const outstandingAmount = financialSummary
    ? financialSummary.adjusted_total_limit - financialSummary.available_limit
    : 0;
  const rawLimitPercent = financialSummary?.adjusted_total_limit
    ? (100 * outstandingAmount) / financialSummary.adjusted_total_limit
    : 100;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  return (
    <Box display="flex" width="100%" justifyContent="space-between">
      <Box display="flex" flexDirection="column">
        <Box display="flex">
          <Box display="flex" flexDirection="column" mb={2}>
            <Typography variant={"h5"}>
              {financialSummary !== null
                ? formatCurrency(financialSummary.total_outstanding_principal)
                : "TBD"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Outstanding Principal
            </Typography>
          </Box>
        </Box>
        <Box display="flex">
          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            minWidth={"200px"}
          >
            <Typography variant={"h6"}>
              {financialSummary !== null
                ? formatCurrency(financialSummary.adjusted_total_limit)
                : "TBD"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Borrowing Limit
            </Typography>
          </Box>
          <Box mr={6} />
          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            minWidth={"200px"}
          >
            <Typography variant={"h6"}>
              {financialSummary !== null
                ? formatCurrency(financialSummary.available_limit)
                : "TBD"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Left to Borrow
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box>
        <GaugeProgressBar
          value={roundedLimitPercent}
          valueFontSize={30}
          caption={"Borrowing Limit Used"}
          circleSize={200}
        />
      </Box>
    </Box>
  );
}
