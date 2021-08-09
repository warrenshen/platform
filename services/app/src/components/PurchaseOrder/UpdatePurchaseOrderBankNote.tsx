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
  Typography,
} from "@material-ui/core";
import {
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  useGetPurchaseOrderForBankQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateBankFieldsMutation } from "lib/api/purchaseOrders";
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

  const {
    data,
    loading: isExistingLoanLoading,
    error,
  } = useGetPurchaseOrderForBankQuery({
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

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const existingPurchaseOrder = data?.purchase_orders_by_pk || null;

  const [
    updateBankFields,
    { loading: isUpdateBankFieldsLoading },
  ] = useCustomMutation(updateBankFieldsMutation);

  const handleClickSave = async () => {
    const response = await updateBankFields({
      variables: {
        purchase_order_id: purchaseOrder.id,
        bank_note: purchaseOrder.bank_note,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError("Could not update purchase order.");
    } else {
      snackbar.showSuccess("Purchase order updated.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormLoading = isUpdateBankFieldsLoading;
  const isSaveDisabled = isFormLoading;

  if (!isDialogReady || !existingPurchaseOrder) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Edit Purchase Order Bank Note
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Box mt={2}>
              <Typography variant="body1">
                {`Customer: ${existingPurchaseOrder.company.name}`}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography variant="body1">
                {`Purchase Order: ${existingPurchaseOrder.order_number}`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
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
