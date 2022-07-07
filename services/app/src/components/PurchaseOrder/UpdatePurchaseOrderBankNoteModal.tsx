import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
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

const getNoteFieldData = (
  purchaseOrder: PurchaseOrdersInsertInput | undefined
) => {
  if (purchaseOrder?.status === RequestStatusEnum.Rejected) {
    return purchaseOrder?.rejection_note
      ? {
          note: purchaseOrder?.rejection_note,
          noteFieldName: "rejection_note",
          noteFieldLabel: "Vendor Rejection Note",
        }
      : {
          note: purchaseOrder?.bank_rejection_note,
          noteFieldName: "bank_rejection_note",
          noteFieldLabel: "Bank Rejection Note",
        };
  }
  return purchaseOrder?.status === RequestStatusEnum.Incomplete
    ? {
        note: purchaseOrder?.bank_incomplete_note,
        noteFieldName: "bank_incomplete_note",
        noteFieldLabel: "Bank Incomplete Note",
      }
    : {
        note: purchaseOrder?.bank_note,
        noteFieldName: "bank_note",
        noteFieldLabel: "Bank Note",
      };
};

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

export default function UpdatePurchaseOrderBankNoteModal({
  purchaseOrderId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  // Default Purchase Order for initialization.
  const newPurchaseOrder: PurchaseOrdersInsertInput = {
    bank_note: "",
    rejection_note: "",
    bank_rejection_note: "",
    bank_incomplete_note: "",
  };

  const [purchaseOrder, setPurchaseOrder] = useState(newPurchaseOrder);
  const [noteFieldData, setNoteFieldData] = useState(
    getNoteFieldData(newPurchaseOrder)
  );

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
        const mergedPurchaseOrder = mergeWith(
          newPurchaseOrder,
          existingPurchaseOrder,
          (a, b) => (isNull(b) ? a : b)
        );
        setPurchaseOrder(mergedPurchaseOrder);
        setNoteFieldData(getNoteFieldData(mergedPurchaseOrder));
      }
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const existingPurchaseOrder = data?.purchase_orders_by_pk || null;

  const [updateBankFields, { loading: isUpdateBankFieldsLoading }] =
    useCustomMutation(updateBankFieldsMutation);

  const handleClickSave = async () => {
    const response = await updateBankFields({
      variables: {
        purchase_order_id: purchaseOrder.id,
        bank_note: purchaseOrder.bank_note,
        rejection_note: purchaseOrder.rejection_note,
        bank_rejection_note: purchaseOrder.bank_rejection_note,
        bank_incomplete_note: purchaseOrder.bank_incomplete_note,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError("Could not update purchase order.");
    } else {
      snackbar.showSuccess("Purchase order updated.");
      handleClose();
    }
  };

  const { note, noteFieldName, noteFieldLabel } = noteFieldData;
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
        Edit Purchase Order {noteFieldLabel}
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
              label={noteFieldLabel}
              helperText={"Only Bespoke Financial users can view this note"}
              defaultValue={note}
              onChange={({ target: { value } }) =>
                setPurchaseOrder({
                  ...purchaseOrder,
                  [noteFieldName]: value,
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
