import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { RequestStatusEnum } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, invoicesRoutes } from "lib/api";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
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
  invoiceId: string;
  linkVal: string; // the link value used to generate this one-time reject ability
  handleClose: () => void;
  handleRejectSuccess: () => void;
}

export default function ReviewInvoiceRejectModal({
  invoiceId,
  linkVal,
  handleClose,
  handleRejectSuccess,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const [rejectionNote, setRejectionNote] = useState("");

  const handleClickReject = async () => {
    const response = await authenticatedApi.post(
      invoicesRoutes.respondToApprovalRequest,
      {
        invoice_id: invoiceId,
        new_request_status: RequestStatusEnum.Rejected,
        rejection_note: rejectionNote,
        link_val: linkVal,
      }
    );
    if (response.data?.status === "ERROR") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.data?.msg}`
      );
    } else {
      snackbar.showSuccess("Invoice rejected.");
      handleRejectSuccess();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Record Rejection Reason
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter in a reason for your rejection of the invoice. After you
          are finished, press the "Confirm" button below.
        </DialogContentText>
        <Box display="flex" flexDirection="column">
          <TextField
            multiline
            label={"Rejection Reason"}
            placeholder={"Enter in the reason for rejection"}
            value={rejectionNote}
            onChange={({ target: { value } }) => setRejectionNote(value)}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={!rejectionNote}
          variant={"contained"}
          color={"primary"}
          onClick={handleClickReject}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
