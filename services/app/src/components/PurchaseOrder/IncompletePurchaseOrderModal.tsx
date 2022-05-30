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
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToPurchaseOrderIncompleteRequestMutation } from "lib/api/purchaseOrders";
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
  purchaseOrderId: string;
  handleClose: () => void;
}

function IncompletePurchaseOrderModal({ purchaseOrderId, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [incompleteNote, setIncompleteNote] = useState("");

  const [
    respondToIncompleteRequest,
    { loading: isRespondToIncompleteRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderIncompleteRequestMutation);

  const handleClickIncomplete = async () => {
    const response = await respondToIncompleteRequest({
      variables: {
        purchase_order_id: purchaseOrderId,
        new_request_status: RequestStatusEnum.Incomplete,
        incomplete_note: incompleteNote,
        link_val: null,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Something went wrong. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Purchase order incompletion registered.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !incompleteNote || isRespondToIncompleteRequestLoading;

  return (
    <Box display="flex" alignItems="center">
      <Dialog
        open
        onClose={handleClose}
        maxWidth="lg"
        classes={{ paper: classes.dialog }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Record Incomplete Reason
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter in a reason for why the Purchase Order is incomplete.
            After you are finished, press "Confirm" button below.
          </DialogContentText>
          <Box display="flex" flexDirection="column">
            <TextField
              multiline
              label={"Incomplete Reason"}
              placeholder={"Enter in the reason for why it's incomplete"}
              value={incompleteNote}
              onChange={({ target: { value } }) => setIncompleteNote(value)}
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
            onClick={handleClickIncomplete}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default IncompletePurchaseOrderModal;
