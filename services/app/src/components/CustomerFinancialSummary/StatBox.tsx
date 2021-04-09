import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ProgressBar from "components/Shared/ProgressBar";
import { FinancialSummaryFragment } from "generated/graphql";
import { round } from "lodash";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {},
    statBoxContent: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progress: {
      marginTop: theme.spacing(4),
    },
  })
);

interface Props {
  financialSummary: FinancialSummaryFragment | null;
}

function StatBox({ financialSummary }: Props) {
  const classes = useStyles();

  const outstandingAmount = financialSummary
    ? financialSummary.adjusted_total_limit - financialSummary.available_limit
    : 0;
  const rawLimitPercent = financialSummary?.adjusted_total_limit
    ? (100 * outstandingAmount) / financialSummary.adjusted_total_limit
    : 100;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  return (
    <Box className={classes.box}>
      <Box display="flex" flexDirection="column">
        <Box style={{ textAlign: "start" }}>
          <Typography variant="h2">
            {financialSummary ? `${roundedLimitPercent}%` : "TBD"}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Borrowing Limit Used
          </Typography>
        </Box>
        <Box className={classes.progress}>
          <ProgressBar value={roundedLimitPercent} />
        </Box>
      </Box>
    </Box>
  );
}

export default StatBox;
