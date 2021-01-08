import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { Create } from "@material-ui/icons";
import Can from "components/Can";
import { usePurchaseOrderQuery } from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/rbac-rules";
import { calendarDateTimestamp } from "lib/time";

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
interface Props {
  id: string;
  handleClose: () => void;
  manipulatePurchaseOrder: (actionType: ActionType, id: string) => void;
}

function ViewModal({ id, handleClose, manipulatePurchaseOrder }: Props) {
  const classes = useStyles();
  const { data } = usePurchaseOrderQuery({
    variables: {
      id: id,
    },
  });
  const purchaseOrder = data?.purchase_orders_by_pk;

  return (
    <Dialog open onClose={handleClose} maxWidth="xl">
      <DialogTitle className={classes.dialogTitle}>
        Purchase Order Details
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="row" width="100%">
          <Box flexDirection="column" flexGrow={1}>
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
              <p>{calendarDateTimestamp(purchaseOrder?.order_date)}</p>
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
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Vendor:</strong>
              </p>
              <p>{purchaseOrder?.vendor?.name}</p>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button className={classes.buttonClass} onClick={handleClose}>
            Cancel
          </Button>
          <Can perform={Action.ManipulatePurchaseOrders}>
            <Button
              className={classes.buttonClass}
              variant="contained"
              color="primary"
              onClick={() => {
                handleClose();
                manipulatePurchaseOrder(ActionType.Update, id);
              }}
              startIcon={<Create />}
            >
              Edit
            </Button>
            <Button
              className={classes.buttonClass}
              variant="contained"
              color="primary"
              onClick={() => {
                handleClose();
                manipulatePurchaseOrder(ActionType.Copy, id);
              }}
              startIcon={<Create />}
            >
              Replicate Purchase Order
            </Button>
          </Can>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ViewModal;
