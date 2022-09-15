import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
  makeStyles,
} from "@material-ui/core";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { closePurchaseOrderMutation } from "lib/api/purchaseOrders";
import { reopenPurchaseOrderMutation } from "lib/api/purchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";

const useStyles = makeStyles({
  label: {
    width: 174,
    color: "#abaaa9",
  },
  confirmButton: {
    color: "#fff",
    marginLeft: 24,
  },
});

interface Props {
  purchaseOrder: any;
  action: Action;
  handleClose: () => void;
}

function ArchivePurchaseOrderModalNew({
  purchaseOrder,
  action,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [archivePurchaseOrder, { loading: isArchivePurchaseOrderLoading }] =
    useCustomMutation(closePurchaseOrderMutation);

  const [unArchivePurchaseOrder, { loading: isUnArchivePurchaseOrderLoading }] =
    useCustomMutation(reopenPurchaseOrderMutation);

  const handleClickConfirm = async () => {
    let response;
    if (action === Action.ArchivePurchaseOrders) {
      response = await archivePurchaseOrder({
        variables: {
          purchase_order_id: purchaseOrder.id,
        },
      });
    } else {
      response = await unArchivePurchaseOrder({
        variables: {
          purchase_order_id: purchaseOrder.id,
        },
      });
    }
    if (response.status !== "OK") {
      snackbar.showError(
        `Could not ${
          action === Action.ArchivePurchaseOrders ? "" : "un"
        }archive purchase order. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        `Purchase order ${
          action === Action.ArchivePurchaseOrders ? "" : "un"
        }archived.`
      );
      handleClose();
    }
  };

  return (
    <ModalDialog
      title={`${
        action === Action.ArchivePurchaseOrders ? "Archive" : "Unarchive"
      } Purchase Order`}
      handleClose={handleClose}
    >
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle2">
            {`Are you sure you want to ${
              action === Action.ArchivePurchaseOrders ? "archive" : "unarchive"
            } the following purchase order?`}
          </Typography>
        </Box>
        {purchaseOrder && (
          <>
            <Box display="flex" pb={2} pt={2}>
              <Box className={classes.label}>Vendor</Box>
              <Box>{getCompanyDisplayName(purchaseOrder.vendor)}</Box>
            </Box>
            <Box display="flex" pb={2}>
              <Box className={classes.label}>PO Number</Box>
              <Box>{purchaseOrder.order_number}</Box>
            </Box>
            <Box display="flex" pb={2}>
              <Box className={classes.label}>PO Date</Box>
              <Box>
                {purchaseOrder.order_date
                  ? formatDateString(purchaseOrder.order_date)
                  : "-"}
              </Box>
            </Box>
            <Box display="flex" pb={2}>
              <Box className={classes.label}>Amount</Box>
              <Box>{formatCurrency(purchaseOrder.amount)}</Box>
            </Box>
            <Box display="flex">
              <Box className={classes.label}>Comments</Box>
              <Box>{purchaseOrder.customer_note || "-"}</Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Box style={{ margin: 32, padding: 0 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            disabled={
              isArchivePurchaseOrderLoading || isUnArchivePurchaseOrderLoading
            }
            onClick={handleClickConfirm}
            variant="contained"
            className={classes.confirmButton}
            style={{
              backgroundColor:
                action === Action.ArchivePurchaseOrders ? "#e75d5d" : "#8eab79",
            }}
          >
            Confirm
          </Button>
        </Box>
      </DialogActions>
    </ModalDialog>
  );
}

export default ArchivePurchaseOrderModalNew;
