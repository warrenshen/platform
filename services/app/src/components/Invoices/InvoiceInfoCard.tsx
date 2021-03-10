import {
  Box,
  Card,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { CheckCircle } from "@material-ui/icons";
import { InvoiceFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";

const useStyles = makeStyles({
  baseInput: {
    width: 300,
  },
  label: {
    width: 130,
    color: grey[600],
  },
});

interface Props {
  invoice: InvoiceFragment;
}

function InvoiceInfoCard({ invoice }: Props) {
  const classes = useStyles();

  return (
    <Box width="fit-content">
      <Card>
        <CardContent>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Vendor</Box>
            <Box>{invoice.payor?.name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Order Number</Box>
            <Box>{invoice.invoice_number}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Invoice Date</Box>
            <Box>{formatDateString(invoice.invoice_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Due Date</Box>
            <Box>{formatDateString(invoice.invoice_due_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Advance Date</Box>
            <Box>{formatDateString(invoice.advance_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Subtotal Amount</Box>
            <Box>{formatCurrency(invoice.subtotal_amount)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Total Amount</Box>
            <Box>{formatCurrency(invoice.total_amount)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Taxes</Box>
            <Box>{formatCurrency(invoice.taxes_amount)}</Box>
          </Box>
          <Box display="flex" alignItems="center" pt={0.5} pb={1}>
            <CheckCircle
              color={invoice.status === "approved" ? "primary" : "disabled"}
            />
            <Box ml={0.5}>
              <Typography variant="body1">Approved</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default InvoiceInfoCard;
