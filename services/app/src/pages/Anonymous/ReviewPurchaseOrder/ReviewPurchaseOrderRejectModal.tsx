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
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { RequestStatusEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToPurchaseOrderApprovalRequestMutation } from "lib/api/purchaseOrders";
import { useContext, useState } from "react";

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
  purchaseOrderId: string;
  linkVal: string; // the link value used to generate this one-time reject ability
  handleClose: () => void;
  handleRejectSuccess: () => void;
}

function ReviewPurchaseOrderRejectModal({
  purchaseOrderId,
  linkVal,
  handleClose,
  handleRejectSuccess,
}: Props) {
  const { user } = useContext(CurrentUserContext);
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [rejectionNote, setRejectionNote] = useState("");

  const [
    respondToApprovalRequest,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderApprovalRequestMutation);

  const handleClickReject = async () => {
    const response = await respondToApprovalRequest({
      variables: {
        purchase_order_id: purchaseOrderId,
        new_request_status: RequestStatusEnum.Rejected,
        rejection_note: rejectionNote,
        rejected_by_user_id: user.id,
        link_val: linkVal,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.data?.msg}`
      );
    } else {
      snackbar.showSuccess("Purchase order rejected.");
      handleRejectSuccess();
    }
  };

  const isSubmitDisabled = !rejectionNote || isRespondToApprovalRequestLoading;

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

export default ReviewPurchaseOrderRejectModal;
