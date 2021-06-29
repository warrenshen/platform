import {
  Box,
  Card,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { CheckCircle } from "@material-ui/icons";
import { PurchaseOrderLimitedFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";

const useStyles = makeStyles({
  label: {
    width: 130,
    color: grey[600],
  },
});

interface Props {
  isApprovedStatusVisible?: boolean;
  purchaseOrder: PurchaseOrderLimitedFragment;
}

export default function PurchaseOrderInfoCard({
  isApprovedStatusVisible = true,
  purchaseOrder,
}: Props) {
  const classes = useStyles();

  return (
    <Box width="fit-content">
      <Card>
        <CardContent>
          {isApprovedStatusVisible && (
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <CheckCircle
                color={
                  purchaseOrder.status === "approved" ? "primary" : "disabled"
                }
              />
              <Box ml={0.5}>
                <Typography variant="body1">Approved</Typography>
              </Box>
            </Box>
          )}
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Vendor</Box>
            <Box>{purchaseOrder.vendor?.name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>PO Number</Box>
            <Box>{purchaseOrder.order_number}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>PO Date</Box>
            <Box>{formatDateString(purchaseOrder.order_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Delivery Date</Box>
            <Box>{formatDateString(purchaseOrder.delivery_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Amount</Box>
            <Box>{formatCurrency(purchaseOrder.amount)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Comments</Box>
            <Box>{purchaseOrder.customer_note || "-"}</Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
