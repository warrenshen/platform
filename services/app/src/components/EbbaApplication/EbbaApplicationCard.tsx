import {
  Box,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import { format, parse } from "date-fns";
import { ContractFragment, EbbaApplicationFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { DateFormatServer } from "lib/date";

interface Props {
  contract: ContractFragment | null;
  ebbaApplication: EbbaApplicationFragment;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 320,
      minHeight: 100,
    },
    label: {
      width: 230,
      color: grey[600],
    },
  })
);

function EbbaApplicationCard({ contract, ebbaApplication }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>Status</Typography>
          <RequestStatusChip requestStatus={ebbaApplication.status} />
        </Box>
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>Application Month</Typography>
          <Typography>
            {format(
              parse(
                ebbaApplication.application_month,
                DateFormatServer,
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
        <Box display="flex" mb={0.25}>
          <Typography className={classes.label}>
            Calculated Borrowing Base
          </Typography>
          <Typography>
            {formatCurrency(ebbaApplication.calculated_borrowing_base)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default EbbaApplicationCard;
