import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { RequestStatusEnum } from "generated/graphql";
import { authenticatedApi, purchaseOrdersRoutes } from "lib/api";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(4),
      padding: 0,
      marginBottom: 16,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  purchaseOrderId: string;
  handleClose: () => void;
  handleRejectSuccess: () => void;
}

function ReviewPurchaseOrderRejectModal({
  purchaseOrderId,
  handleClose,
  handleRejectSuccess,
}: Props) {
  const classes = useStyles();
  const [rejectionNote, setRejectionNote] = useState("");

  const handleClickReject = async () => {
    const response = await authenticatedApi.post(
      purchaseOrdersRoutes.respondToApprovalRequest,
      {
        purchase_order_id: purchaseOrderId,
        new_request_status: RequestStatusEnum.Rejected,
        rejection_note: rejectionNote,
      }
    );
    if (response.data?.status === "ERROR") {
      alert(response.data?.msg);
    } else {
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
          ></TextField>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={!rejectionNote}
          variant={"contained"}
          color={"secondary"}
          onClick={handleClickReject}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewPurchaseOrderRejectModal;
