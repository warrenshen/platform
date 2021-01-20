import { Box, Card, CardContent, makeStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { CheckCircle } from "@material-ui/icons";
import { PurchaseOrderFragment } from "generated/graphql";

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

function InfoCard(props: Props) {
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
            <Box className={classes.label}>PO Date</Box>
            <Box>{props.purchaseOrder.order_date}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Delivery Date</Box>
            <Box>{props.purchaseOrder.delivery_date}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Amount</Box>
            <Box>{`$${Intl.NumberFormat("en-US").format(
              props.purchaseOrder.amount
            )}`}</Box>
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

export default InfoCard;
