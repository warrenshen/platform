import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { InvoiceFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitInvoiceForPaymentMutation } from "lib/api/invoices";

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

  const filteredInvoices = invoices.filter(
    (i) => !i.payment_confirmed_at && !i.payment_rejected_at
  );

  const handleSubmit = async () => {
    const response = await submitInvoiceForPayment({
      variables: {
        invoice_ids: filteredInvoices.map((i) => i.id),
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError("Failed to submit invoices for payment");
    } else {
      snackbar.showSuccess("Invoices submitted for payment.");
    }

    handleClose();
  };

  const areAnyInvoicesAvailable = !!filteredInvoices.length;
  const someInvoicesElided = filteredInvoices.length !== invoices.length;

  if (!areAnyInvoicesAvailable) {
    return (
      <Dialog open onClose={handleClose} classes={{ paper: classes.dialog }}>
        <DialogTitle className={classes.dialogTitle}>
          Payor Already Responded
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Alert severity="warning">
              The payor(s) of the selected invoice(s) already confirmed or
              rejected payment. There's nothing left for you to do here.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Box>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  }

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
        {someInvoicesElided && (
          <Box mt={1}>
            <Alert severity="warning">
              Some invoices were removed from your selection because the payor
              has already responded to a request for payment.
            </Alert>
          </Box>
        )}
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
