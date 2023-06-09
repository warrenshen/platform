import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import EbbaApplicationDrawerLauncher from "components/EbbaApplication/EbbaApplicationDrawerLauncher";
import EbbaApplicationStatusChip from "components/EbbaApplication/EbbaApplicationStatusChip";
import { EbbaApplicationFragment } from "generated/graphql";
import { formatDateString } from "lib/date";
import { CustomerSurveillanceCategoryEnum } from "lib/enum";
import { formatCurrency } from "lib/number";

interface Props {
  ebbaApplication: EbbaApplicationFragment;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 400,
    },
    label: {
      width: 250,
      color: grey[600],
    },
  })
);

export default function EbbaApplicationCard({ ebbaApplication }: Props) {
  const classes = useStyles();

  const isBorrowingBase =
    ebbaApplication?.category ===
    CustomerSurveillanceCategoryEnum.BorrowingBase;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" mb={0.5}>
          <Typography className={classes.label}>Status</Typography>
          <EbbaApplicationStatusChip requestStatus={ebbaApplication.status} />
        </Box>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Typography className={classes.label}>Certification Date</Typography>
          <Typography>
            {formatDateString(ebbaApplication.application_date)}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Typography className={classes.label}>Expiration Date</Typography>
          <Typography>
            {formatDateString(ebbaApplication.expires_date)}
          </Typography>
        </Box>
        {isBorrowingBase && (
          <>
            <Box display="flex" mb={0.5}>
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
              <Typography className={classes.label}>
                Inventory Balance
              </Typography>
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
            {!!ebbaApplication.amount_custom && (
              <>
                <Box display="flex" mb={0.5}>
                  <Typography className={classes.label}>
                    Adjustment Amount
                  </Typography>
                  <Typography>
                    {formatCurrency(ebbaApplication.amount_custom)}
                  </Typography>
                </Box>
                <Box display="flex" mb={0.5}>
                  <Typography className={classes.label}>
                    Adjustment Note
                  </Typography>
                  <Typography>{ebbaApplication.amount_custom_note}</Typography>
                </Box>
              </>
            )}
          </>
        )}
        <Box display="flex" flexDirection="column" pb={0.25}>
          <Box display="flex" mt={1}>
            <EbbaApplicationDrawerLauncher
              ebbaApplicationId={ebbaApplication.id}
            >
              {(handleClick) => (
                <Button size="small" variant="outlined" onClick={handleClick}>
                  View
                </Button>
              )}
            </EbbaApplicationDrawerLauncher>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
