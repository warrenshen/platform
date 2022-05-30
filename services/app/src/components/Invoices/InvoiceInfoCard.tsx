import {
  Box,
  Card,
  CardContent,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { CheckCircle } from "@material-ui/icons";
import { InvoiceLimitedFragment } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";

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
  isApprovedStatusVisible?: boolean;
  invoice: InvoiceLimitedFragment;
}

export default function InvoiceInfoCard({
  isApprovedStatusVisible = true,
  invoice,
}: Props) {
  const classes = useStyles();

  return (
    <Box width="fit-content">
      <Card>
        <CardContent>
          {isApprovedStatusVisible && (
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <CheckCircle
                color={invoice.status === "approved" ? "primary" : "disabled"}
              />
              <Box ml={0.5}>
                <Typography variant="body1">Approved</Typography>
              </Box>
            </Box>
          )}
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Payor</Box>
            <Box>{getCompanyDisplayName(invoice.payor)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Invoice Number</Box>
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
            <Box className={classes.label}>Subtotal Amount</Box>
            <Box>{formatCurrency(invoice.subtotal_amount)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Taxes</Box>
            <Box>{formatCurrency(invoice.taxes_amount)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Total Amount</Box>
            <Box>{formatCurrency(invoice.total_amount)}</Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
