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
import { Loans } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { rejectLoanMutation } from "lib/api/loans";
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
  loanId: Loans["id"];
  handleClose: () => void;
}

function ReviewLoanRejectModal({ loanId, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const [rejectionNote, setRejectionNote] = useState("");

  const [rejectLoan, { loading: isRejectLoanLoading }] =
    useCustomMutation(rejectLoanMutation);

  const handleClickReject = async () => {
    const response = await rejectLoan({
      variables: {
        loan_id: loanId,
        rejection_note: rejectionNote,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Could not reject loan. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Loan rejected and email sent to customer.");
      handleClose();
    }
  };

  const isSubmitDisabled = isRejectLoanLoading || !rejectionNote;

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
          Please enter in a reason for your rejection of the Purchase Order.
          After you are finished, press the "Confirm" button below.
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
          disabled={isSubmitDisabled}
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

export default ReviewLoanRejectModal;
