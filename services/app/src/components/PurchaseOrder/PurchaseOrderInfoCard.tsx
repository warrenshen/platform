import { Box, Card, CardContent, makeStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { CheckCircle } from "@material-ui/icons";
import { PurchaseOrderFragment } from "generated/graphql";
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
  purchaseOrder: PurchaseOrderFragment;
}

function PurchaseOrderInfoCard(props: Props) {
  const classes = useStyles();

  return (
    <Box width="fit-content">
      <Card>
        <CardContent>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Vendor</Box>
            <Box>{props.purchaseOrder.vendor?.name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Order Number</Box>
            <Box>{props.purchaseOrder.order_number}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Order Date</Box>
            <Box>{formatDateString(props.purchaseOrder.order_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Delivery Date</Box>
            <Box>{formatDateString(props.purchaseOrder.delivery_date)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Amount</Box>
            <Box>{formatCurrency(props.purchaseOrder.amount)}</Box>
          </Box>
          <Box display="flex" pt={0.5} pb={1}>
            <CheckCircle
              color={
                props.purchaseOrder.status === "approved"
                  ? "primary"
                  : "disabled"
              }
            ></CheckCircle>
            Approved
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PurchaseOrderInfoCard;
