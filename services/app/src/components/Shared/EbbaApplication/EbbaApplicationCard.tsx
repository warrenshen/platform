import {
  Box,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { format, parse } from "date-fns";
import { EbbaApplicationFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";

interface Props {
  ebbaApplication: EbbaApplicationFragment;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 300,
      minHeight: 100,
    },
    label: {
      width: 160,
      color: grey[600],
    },
  })
);

function EbbaApplicationCard({ ebbaApplication }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>Application Month</Typography>
          <Typography>
            {format(
              parse(
                ebbaApplication.application_month,
                "yyyy-MM-dd",
                new Date()
              ),
              "MM/yyyy"
            )}
          </Typography>
        </Box>
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>
            Monthly Accounts Receivable
          </Typography>
          <Typography>
            {formatCurrency(ebbaApplication.monthly_accounts_receivable)}
          </Typography>
        </Box>
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>Monthly Inventory</Typography>
          <Typography>
            {formatCurrency(ebbaApplication.monthly_inventory)}
          </Typography>
        </Box>
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>Monthly Cash</Typography>
          <Typography>
            {formatCurrency(ebbaApplication.monthly_cash)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default EbbaApplicationCard;
