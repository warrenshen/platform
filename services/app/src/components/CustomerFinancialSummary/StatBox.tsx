import {
  Box,
  Card,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ProgressBar from "components/Shared/ProgressBar";
import { FinancialSummaryFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "33%",
      minWidth: "350px",
    },
    statBoxContent: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progress: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
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
  const limitPercent = financialSummary
    ? (100 * outstandingAmount) / financialSummary.adjusted_total_limit
    : 0;

  return (
    <Box className={classes.box}>
      <Card>
        <Box display="flex" flexDirection="column" p={2}>
          <Typography variant="h4">
            {financialSummary
              ? formatCurrency(financialSummary.adjusted_total_limit)
              : "TBD"}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            total limit
          </Typography>
          <div className={classes.progress}>
            <ProgressBar value={limitPercent} />
          </div>
          <Box className={classes.statBoxContent}>
            <Box>
              <Typography variant="h5">
                {financialSummary ? formatCurrency(outstandingAmount) : "TBD"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                outstanding amount
              </Typography>
            </Box>
            <Box style={{ textAlign: "end" }}>
              <Typography variant="h5">
                {financialSummary
                  ? formatCurrency(financialSummary.available_limit)
                  : "TBD"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                remaining amount
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default StatBox;
