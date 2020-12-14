import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { Attachment, Create, Email, Print } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { PURCHASE_ORDERS, VENDORS } from "../models/fakeData";
import { PurchaseOrder, PURCHASE_ORDER_EMPTY } from "../models/PurchaseOrder";
import ItemsList from "./ItemsList";
const useStyles = makeStyles(() =>
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
  })
);
interface Props {
  id: string;
  handleClose: () => void;
  createPurchaseOrderReplica: (id: string) => void;
}

function ViewModal({ id, handleClose, createPurchaseOrderReplica }: Props) {
  const classes = useStyles();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>(
    PURCHASE_ORDER_EMPTY
  );
  const [parentPurchaseOrder, setParentPurchaseOrder] = useState<PurchaseOrder>(
    PURCHASE_ORDER_EMPTY
  );
  const [vendor, setVendor] = useState({ id: "", name: "" });
  useEffect(() => {
    const purchaseOrderFromApi = PURCHASE_ORDERS.find((po) => po.id === id);
    if (purchaseOrderFromApi) {
      setPurchaseOrder(purchaseOrderFromApi);
    }
  }, [id]);
  useEffect(() => {
    const parentPurchaseOrderFromApi = PURCHASE_ORDERS.find(
      (ppo) => ppo.id === purchaseOrder.parent_purchase_order_id
    );
    if (parentPurchaseOrderFromApi) {
      setParentPurchaseOrder(parentPurchaseOrderFromApi);
    }
  }, [purchaseOrder]);
  useEffect(() => {
    const vendorFromApi = VENDORS.find((v) => v.id === purchaseOrder.vendor_id);
    if (vendorFromApi) {
      setVendor(vendorFromApi);
    }
  }, [purchaseOrder]);
  return (
    <Dialog
      open
      onClose={handleClose}
      // className={classes.dialog}
      maxWidth="xl"
    >
      {" "}
      <DialogTitle className={classes.dialogTitle}>
        Purchase Order Details
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="row" width="100%">
          <Box flexDirection="column" flexGrow={1}>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>PO Number</strong>
              </p>
              <p>{purchaseOrder.purchase_order_number}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Parent PO Number</strong>
              </p>
              <p>{parentPurchaseOrder.purchase_order_number}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Parent PO Amount</strong>
              </p>
              <p>{`$${purchaseOrder.parent_amount}.00`}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>PO Date</strong>
              </p>
              <p>{purchaseOrder.created_at.toDateString()}</p>
            </Box>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Status</strong>
              </p>
              <p>{purchaseOrder.status}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Amount</strong>
              </p>
              <p>{`$${purchaseOrder.amount}.00`}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Debtor</strong>
              </p>
              <p>{purchaseOrder.debtor}</p>
            </Box>
            <Box display="flex" flexDirection="row" m={1}>
              <p className={classes.propertyLabel}>
                <strong>Anchor</strong>
              </p>
              <p>{vendor.name}</p>
            </Box>
          </Box>
        </Box>
        <Box>
          <p>
            <strong>Remark</strong>
            {purchaseOrder.remarks}
          </p>

          <p>
            <strong>Delivery Address</strong>
            {purchaseOrder.delivery_address}
          </p>
        </Box>

        <ItemsList purchaseOrderItems={purchaseOrder.items}></ItemsList>
      </DialogContent>
      <DialogActions>
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
              createPurchaseOrderReplica(id);
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
