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
  Theme,
} from "@material-ui/core";
import InvoiceInfoCard from "components/Invoices/InvoiceInfoCard";
import { InvoiceFragment, RequestStatusEnum } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, invoicesRoutes } from "lib/api";

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
  invoice: InvoiceFragment;
  linkVal: string; // the link value used to generate this one-time reject ability
  handleClose: () => void;
  handleApproveSuccess: () => void;
}

export default function ReviewInvoiceApproveModal({
  invoice,
  linkVal,
  handleClose,
  handleApproveSuccess,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const handleClickApprove = async () => {
    const response = await authenticatedApi.post(
      invoicesRoutes.respondToApprovalRequest,
      {
        invoice_id: invoice.id,
        new_request_status: RequestStatusEnum.Approved,
        rejection_note: "",
        link_val: linkVal,
      }
    );
    if (response.data?.status === "ERROR") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.data?.msg}`
      );
    } else {
      snackbar.showSuccess("Invoice approved.");
      handleApproveSuccess();
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
        Confirm Invoice Due Date
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please confirm that the invoice due date is correct and that you have
          not paid off this invoice to {invoice.company.name} yet.
        </DialogContentText>
        <Box display="flex" flexDirection="row" justifyContent="center">
          <InvoiceInfoCard invoice={invoice} />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
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
