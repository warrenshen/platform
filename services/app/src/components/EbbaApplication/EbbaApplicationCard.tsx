import {
  Box,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import EbbaApplicationDrawerLauncher from "components/EbbaApplication/EbbaApplicationDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import { EbbaApplicationFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";

interface Props {
  ebbaApplication: EbbaApplicationFragment;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 360,
    },
    label: {
      width: 230,
      color: grey[600],
    },
  })
);

function EbbaApplicationCard({ ebbaApplication }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Typography className={classes.label}>Platform ID</Typography>
          <EbbaApplicationDrawerLauncher
            ebbaApplicationId={ebbaApplication.id}
          />
        </Box>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>Status</Typography>
          <RequestStatusChip requestStatus={ebbaApplication.status} />
        </Box>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>Certification Date</Typography>
          <Typography>
            {formatDateString(ebbaApplication.application_date)}
          </Typography>
        </Box>
        <Box display="flex" mb={2.5}>
          <Typography className={classes.label}>
            Calculated Borrowing Base
          </Typography>
          <Typography>
            {formatCurrency(ebbaApplication.calculated_borrowing_base)}
          </Typography>
        </Box>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>
            Accounts Receivable Balance
          </Typography>
          <Typography>
            {formatCurrency(ebbaApplication.monthly_accounts_receivable)}
          </Typography>
        </Box>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>Inventory Balance</Typography>
          <Typography>
            {formatCurrency(ebbaApplication.monthly_inventory)}
          </Typography>
        </Box>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>
            Cash in Deposit Accounts
          </Typography>
          <Typography>
            {formatCurrency(ebbaApplication.monthly_cash)}
          </Typography>
        </Box>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>Cash in DACA</Typography>
          <Typography>
            {formatCurrency(ebbaApplication.amount_cash_in_daca)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default EbbaApplicationCard;
