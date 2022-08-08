import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  PurchaseOrderFragment,
  RequestStatusEnum,
  useCompanyVendorPartnershipForVendorQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToPurchaseOrderApprovalRequestNewMutation } from "lib/api/purchaseOrders";
import { useContext } from "react";

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
  purchaseOrder: PurchaseOrderFragment;
  linkVal: string; // the link value used to generate this one-time approve ability
  handleClose: () => void;
  handleApproveSuccess: () => void;
}

function ReviewPurchaseOrderApproveModalNew({
  purchaseOrder,
  linkVal,
  handleClose,
  handleApproveSuccess,
}: Props) {
  const { user } = useContext(CurrentUserContext);
  const snackbar = useSnackbar();
  const classes = useStyles();

  const {
    data,
    loading: isCompanyVendorPartnershipLoading,
    error,
  } = useCompanyVendorPartnershipForVendorQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId: purchaseOrder.company_id,
      vendorId: purchaseOrder.vendor_id,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const [
    respondToApprovalRequest,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderApprovalRequestNewMutation);

  if (!data?.company_vendor_partnerships[0]?.vendor_bank_account) {
    if (!isCompanyVendorPartnershipLoading) {
      snackbar.showError(
        "Bespoke Financial does not have your bank account information. Please contact Bespoke Financial to resolve this."
      );
    }
    return null;
  }

  const vendorBankAccount = data.company_vendor_partnerships[0]
    .vendor_bank_account as BankAccountFragment;

  const handleClickApprove = async () => {
    const response = await respondToApprovalRequest({
      variables: {
        purchase_order_id: purchaseOrder.id,
        new_request_status: RequestStatusEnum.Approved,
        approved_by_user_id: user.id,
        rejection_note: "",
        link_val: linkVal,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Something went wrong. Reason: ${response.msg}`);
    } else {
      snackbar.showSuccess("Purchase order approved.");
      handleApproveSuccess();
    }
  };

  const isSubmitDisabled = isRespondToApprovalRequestLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      classes={{ paper: classes.dialog }}
      data-cy={"review-bank-information-modal"}
    >
      <DialogTitle className={classes.dialogTitle}>
        Confirm Bank Information
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please verify that your bank information below is up-to-date. This
          bank account is where Bespoke will send financing to. If the
          information is not up-to-date, please contact us.
        </DialogContentText>
        <Box>
          <BankAccountInfoCard bankAccount={vendorBankAccount} />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          data-cy={"confirm-bank-information"}
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

export default ReviewPurchaseOrderApproveModalNew;
