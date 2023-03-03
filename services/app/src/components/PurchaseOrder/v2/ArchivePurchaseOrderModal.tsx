import {
  Box,
  DialogActions,
  DialogContent,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryWarningButton from "components/Shared/Button/PrimaryWarningButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { archivePurchaseOrderMutation } from "lib/api/purchaseOrders";
import { unarchivePurchaseOrderMutation } from "lib/api/purchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      width: 174,
      color: "#abaaa9",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    confirmButton: {
      color: "#fff",
      marginLeft: 24,
    },
  })
);

interface Props {
  purchaseOrder: any;
  action: Action;
  handleClose: () => void;
}

function ArchivePurchaseOrderModal({
  purchaseOrder,
  action,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [archivePurchaseOrder, { loading: isArchivePurchaseOrderLoading }] =
    useCustomMutation(archivePurchaseOrderMutation);

  const [unArchivePurchaseOrder, { loading: isUnArchivePurchaseOrderLoading }] =
    useCustomMutation(unarchivePurchaseOrderMutation);

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
      <DialogActions className={classes.dialogActions}>
        <SecondaryButton
          dataCy={"archive-po-cancel-button"}
          text={"Cancel"}
          onClick={handleClose}
        />
        <PrimaryWarningButton
          dataCy={"archive-po-confirm-button"}
          isDisabled={
            isArchivePurchaseOrderLoading || isUnArchivePurchaseOrderLoading
          }
          text={"Confirm"}
          onClick={handleClickConfirm}
        />
      </DialogActions>
    </ModalDialog>
  );
}

export default ArchivePurchaseOrderModal;
