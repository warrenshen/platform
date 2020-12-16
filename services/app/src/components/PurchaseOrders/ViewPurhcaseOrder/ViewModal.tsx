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
import { Attachment, Create, Email, Print } from "@material-ui/icons";
import { usePurchaseOrderQuery } from "generated/graphql";
import { ActionType } from "../models/ActionType";
import ItemsList from "./ItemsList";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      marginLeft: 21,
      marginRight: 21,
      borderBottom: "1px solid #c7c7c7",
    },
    buttonClass: {
      marginLeft: 10,
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
      marginBottom: 15,
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
  const { data, loading } = usePurchaseOrderQuery({
    variables: {
      id: id,
    },
  });
  const purchaseOrder = data?.purchase_orders_by_pk;
  return (
    <Dialog open onClose={handleClose} maxWidth="xl">
      {" "}
      <DialogTitle className={classes.dialogTitle}>
        Purchase Order Details
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="row" width="100%">
          <Box flexDirection="column" flexGrow={1}>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>PO Number:</strong>
              </p>
              <p>{purchaseOrder?.purchase_order_number}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Amount:</strong>
              </p>
              <p>{purchaseOrder?.amount}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>PO Date:</strong>
              </p>
              <p>{purchaseOrder?.created_at}</p>
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
                <strong>Parent PO Number:</strong>
              </p>
              <p>{purchaseOrder?.parent_purchase_order_id}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Parent PO Amount:</strong>
              </p>
              <p>{purchaseOrder?.parent_purchase_order?.amount}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Status</strong>
              </p>
              <p>{purchaseOrder?.status}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Anchor:</strong>
              </p>
              <p>{purchaseOrder?.vendor?.name}</p>
            </Box>
          </Box>
        </Box>
        <Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Remark:</strong>
            </p>
            <p>{purchaseOrder?.remarks}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Delivery Address:</strong>
            </p>
            <p>{` ${purchaseOrder?.address}, ${purchaseOrder?.country}, ${purchaseOrder?.city}, ${purchaseOrder?.zip_code}`}</p>
          </Box>
        </Box>

        <ItemsList
          purchaseOrderItems={
            purchaseOrder?.line_items ? purchaseOrder?.line_items : []
          }
        ></ItemsList>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button className={classes.buttonClass} onClick={handleClose}>
            Cancel
          </Button>
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
          <Button
            className={classes.buttonClass}
            variant="contained"
            color="primary"
            onClick={handleClose}
            startIcon={<Attachment />}
          >
            Attachments
          </Button>
          <Button
            className={classes.buttonClass}
            variant="contained"
            color="primary"
            onClick={handleClose}
            startIcon={<Print />}
          >
            Print
          </Button>
          <Button
            className={classes.buttonClass}
            variant="contained"
            color="primary"
            onClick={handleClose}
            startIcon={<Email />}
          >
            Chat
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ViewModal;
