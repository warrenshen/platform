import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  usePurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

export default function UpdatePurchaseOrderBankNote({
  purchaseOrderId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  // Default Loan for initialization.
  const newPurchaseOrder: PurchaseOrdersInsertInput = {
    bank_note: "",
  };

  const [purchaseOrder, setPurchaseOrder] = useState(newPurchaseOrder);

  const { loading: isExistingLoanLoading } = usePurchaseOrderQuery({
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
    },
    onCompleted: (data) => {
      const existingPurchaseOrder = data?.purchase_orders_by_pk;
      if (existingPurchaseOrder) {
        setPurchaseOrder(
          mergeWith(newPurchaseOrder, existingPurchaseOrder, (a, b) =>
            isNull(b) ? a : b
          )
        );
      }
    },
  });

  const [
    updatePurchaseOrder,
    { loading: isUpdateLoanLoading },
  ] = useUpdatePurchaseOrderMutation();

  const handleClickSave = async () => {
    const response = await updatePurchaseOrder({
      variables: {
        id: purchaseOrder.id,
        purchaseOrder: {
          bank_note: purchaseOrder.bank_note,
        },
      },
    });
    if (!response.data?.update_purchase_orders_by_pk) {
      snackbar.showError("Could not update purchase order.");
    } else {
      snackbar.showSuccess("Purchase order updated.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormLoading = isUpdateLoanLoading;
  const isSaveDisabled = isFormLoading;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Edit Bank Note</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <TextField
            autoFocus
            multiline
            label={"Bank Note"}
            helperText={"Only Bespoke Financial users can view this note"}
            value={purchaseOrder.bank_note}
            onChange={({ target: { value } }) =>
              setPurchaseOrder({
                ...purchaseOrder,
                bank_note: value,
              })
            }
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={isSaveDisabled}
            onClick={handleClickSave}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
