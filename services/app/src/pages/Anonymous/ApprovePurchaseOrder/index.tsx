import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { usePurchaseOrderForReviewQuery } from "generated/graphql";
import { useContext } from "react";

interface Props {
  location: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    buttonClass: {
      marginLeft: theme.spacing(1),
    },
    propertyLabel: {
      flexGrow: 1,
    },
    constLabels: {
      minWidth: 150,
    },
    dialogActions: {
      margin: theme.spacing(2),
      marginTop: 0,
      marginBottom: theme.spacing(2),
    },
  })
);

function ApprovePurchaseOrder(props: Props) {
  const classes = useStyles();
  const location: any = props.location;
  const { user } = useContext(CurrentUserContext);
  console.log({ user });

  const payload = location.state?.payload;
  const purchaseOrderId = payload?.purchase_order_id;

  const { data } = usePurchaseOrderForReviewQuery({
    variables: {
      id: purchaseOrderId,
    },
  });
  const purchaseOrder = data?.purchase_orders_by_pk;

  return location.state ? (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box width="300px" display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Box>
            <h2>Purchase order confirmation</h2>
            <p>
              The purchase order listed below requires your confirmation before
              we can process payment. Please review the information and press
              approve or reject.
            </p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Number:</strong>
            </p>
            <p>{purchaseOrder?.order_number}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Amount:</strong>
            </p>
            <p>{purchaseOrder?.amount}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Date:</strong>
            </p>
            <p>{purchaseOrder?.order_date}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Debtor:</strong>
            </p>
            <p>{purchaseOrder?.company?.name}</p>
          </Box>
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Status</strong>
            </p>
            <p>{purchaseOrder?.status}</p>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={false}
            onClick={() => console.log("Reject button clicked")}
            variant={"contained"}
            color={"secondary"}
          >
            Reject
          </Button>
          <Button
            disabled={false}
            onClick={() => console.log("Approve button clicked")}
            variant={"contained"}
            color={"primary"}
          >
            Approve
          </Button>
        </Box>
      </Box>
    </Box>
  ) : null;
}

export default ApprovePurchaseOrder;
