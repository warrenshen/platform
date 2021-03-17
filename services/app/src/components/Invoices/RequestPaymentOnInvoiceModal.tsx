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
import { Alert } from "@material-ui/lab";
import { InvoiceFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitInvoiceForPaymentMutation } from "lib/api/invoices";
import React from "react";
import InvoicesDataGrid from "./InvoicesDataGrid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 1000,
    },
    dialogFatalError: {
      width: 600,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
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
  invoices: InvoiceFragment[];
  handleClose: () => void;
}

export default function RequestPaymentOnInvoiceModal({
  invoices,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [submitInvoiceForPayment] = useCustomMutation(
    submitInvoiceForPaymentMutation
  );

  const handleSubmit = async () => {
    const response = await submitInvoiceForPayment({
      variables: {
        invoice_ids: invoices.map((i) => i.id),
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError("Failed to submit invoices for payment");
    } else {
      snackbar.showSuccess("Invoices submitted for payment.");
    }

    handleClose();
  };

  return (
    <Dialog open onClose={handleClose} classes={{ paper: classes.dialog }}>
      <DialogTitle className={classes.dialogTitle}>
        Request Payment on Invoices
      </DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Alert>
            When you click "Submit", Bespoke will email the payors associated
            with the invoices you selected requesting payment. Your payors will
            recieve and link in the email that will take them to a page where
            they can complete payment.
          </Alert>
        </Box>
        <Box>
          <InvoicesDataGrid
            isCompanyVisible={false}
            isMultiSelectEnabled={false}
            invoices={invoices}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
