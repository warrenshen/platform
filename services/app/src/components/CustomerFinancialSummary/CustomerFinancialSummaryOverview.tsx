import {
  Box,
  Card,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { FinancialSummaryFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import React from "react";

interface Props {
  financialSummary: FinancialSummaryFragment | null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "33%",
    },
  })
);

function CustomerFinancialSummaryOverview({ financialSummary }: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {financialSummary
                  ? formatCurrency(
                      financialSummary?.total_outstanding_principal
                    )
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                total outstanding principal balance
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {financialSummary
                  ? formatCurrency(financialSummary?.total_outstanding_interest)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                total outstanding interest
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {financialSummary
                  ? formatCurrency(financialSummary?.total_outstanding_fees)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                total outstanding fees
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
      <Box mt={1} />
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {financialSummary
                  ? formatCurrency(financialSummary.available_limit)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                remaining limit
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box className={classes.box}>
          <Card>
            <Box display="flex" flexDirection="column" p={2}>
              <Typography variant="h4">
                {financialSummary
                  ? formatCurrency(financialSummary.total_limit)
                  : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                total limit
              </Typography>
            </Box>
          </Card>
        </Box>
        <Box className={classes.box} />
      </Box>
    </Box>
  );
}

export default CustomerFinancialSummaryOverview;
