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
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { InvoiceFragment, RequestStatusEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToInvoiceApprovalRequestMutation } from "lib/api/invoices";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
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
  invoice: InvoiceFragment;
  handleClose: () => void;
}

function ApproveInvoiceModal({ invoice, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [
    respondToApprovalRequest,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToInvoiceApprovalRequestMutation);

  const handleClickApprove = async () => {
    const response = await respondToApprovalRequest({
      variables: {
        invoice_id: invoice.id,
        new_request_status: RequestStatusEnum.Approved,
        rejection_note: "",
        link_val: null,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Something went wrong. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Invoice approved.");
      handleClose();
    }
  };

  const isSubmitDisabled = isRespondToApprovalRequestLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Approve Invoice</DialogTitle>
      <DialogContent>
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              Warning: you are approving a invoice on behalf of the payor (only
              bank admins can do this).
            </Typography>
          </Alert>
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
          onClick={handleClickApprove}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApproveInvoiceModal;
