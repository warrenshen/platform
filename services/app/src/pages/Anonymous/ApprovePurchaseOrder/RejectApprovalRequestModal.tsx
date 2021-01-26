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
import { RequestStatusEnum } from "generated/graphql";
import { authenticatedApi, purchaseOrdersRoutes } from "lib/api";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {},
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "200px",
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

function RejectApprovalRequestModal({
  purchaseOrderId,
  handleClose,
  handleRejectSuccess,
}: Props) {
  const classes = useStyles();
  const [rejectionNote, setRejectionNote] = useState("");

  const handleClickReject = async () => {
    // TODO: set up `reject_note` to come from user input.
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
        Reject Purchase Order
      </DialogTitle>
      <DialogContent>
        <Box>
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
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RejectApprovalRequestModal;
