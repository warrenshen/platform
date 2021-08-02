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
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import {
  PurchaseOrderFragment,
  RequestStatusEnum,
  useCompanyVendorPartnershipForVendorQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToPurchaseOrderApprovalRequestMutation } from "lib/api/purchaseOrders";

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
  purchaseOrder: PurchaseOrderFragment;
  handleClose: () => void;
}

function ApprovePurchaseOrderModal({ purchaseOrder, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const {
    data,
    loading: isCompanyVendorPartnershipLoading,
  } = useCompanyVendorPartnershipForVendorQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId: purchaseOrder.company_id,
      vendorId: purchaseOrder.vendor_id,
    },
  });

  const [
    respondToApprovalRequest,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderApprovalRequestMutation);

  const vendorBankAccount =
    data?.company_vendor_partnerships[0]?.vendor_bank_account || null;

  const handleClickApprove = async () => {
    const response = await respondToApprovalRequest({
      variables: {
        purchase_order_id: purchaseOrder.id,
        new_request_status: RequestStatusEnum.Approved,
        rejection_note: "",
        link_val: null,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Something went wrong. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Purchase order approved.");
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
      <DialogTitle className={classes.dialogTitle}>
        Approve Purchase Order
      </DialogTitle>
      <DialogContent>
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              Warning: you are approving a purchase order on behalf of the
              vendor (only bank admins can do this).
            </Typography>
          </Alert>
        </Box>
        <DialogContentText>
          The following bank account is what is on file for the vendor.
        </DialogContentText>
        <Box>
          {isCompanyVendorPartnershipLoading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : vendorBankAccount ? (
            <BankAccountInfoCard bankAccount={vendorBankAccount} />
          ) : (
            <Typography variant="body1">No bank account</Typography>
          )}
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

export default ApprovePurchaseOrderModal;
