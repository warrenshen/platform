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
import { PaymentsInsertInput, useGetPaymentQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { editRepaymentBankNoteMutation } from "lib/finance/payments/repayment";
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
  paymentId: string | null;
  handleClose: () => void;
}

export default function UpdateRepaymentBankNoteModal({
  paymentId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const newPayment: PaymentsInsertInput = {
    bank_note: "",
  };

  const [payment, setPayment] = useState(newPayment);

  const {
    data,
    loading: isExistingLoanLoading,
    error,
  } = useGetPaymentQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
    },
    onCompleted: (data) => {
      const existingPayments = data?.payments_by_pk;
      if (existingPayments) {
        setPayment(
          mergeWith(newPayment, existingPayments, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const existingPayment = data?.payments_by_pk || null;

  const [editRepaymentBankNote, { loading: isEditRepaymentBankNoteLoading }] =
    useCustomMutation(editRepaymentBankNoteMutation);

  const handleClickSave = async () => {
    const response = await editRepaymentBankNote({
      variables: {
        companyId: payment.company_id,
        repaymentId: payment.id,
        bankNote: payment.bank_note,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError("Could not update repayment.");
    } else {
      snackbar.showSuccess("Repayment updated.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormLoading = isEditRepaymentBankNoteLoading;
  const isSaveDisabled = isFormLoading;

  if (!isDialogReady || !existingPayment) {
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
        Edit Repayment Bank Note
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Box mt={2}>
              <Typography variant="body1">
                {`Customer: ${existingPayment.company.name}`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              autoFocus
              multiline
              label={"Bank Note"}
              helperText={"Only Bespoke Financial users can view this note"}
              value={payment.bank_note}
              onChange={({ target: { value } }) =>
                setPayment({
                  ...payment,
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
