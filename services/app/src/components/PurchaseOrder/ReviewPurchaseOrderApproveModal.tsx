import {
  Box,
  DialogActions,
  DialogContent,
  DialogContentText,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import BankAccountInfoCardContent from "components/BankAccount/BankAccountInfoCardContent";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  PurchaseOrderFragment,
  RequestStatusEnum,
  useCompanyVendorPartnershipForVendorQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { approvePurchaseOrderutation } from "lib/api/purchaseOrders";
import { useContext } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 600,
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
  linkVal?: string; // the link value used to generate this one-time approve ability
  handleClose: () => void;
  handleApproveSuccess: () => void;
}

function ReviewPurchaseOrderApproveModal({
  purchaseOrder,
  linkVal = "",
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

  const [approvePurchaseOrder, { loading: isApprovePurchaseOrderLoading }] =
    useCustomMutation(approvePurchaseOrderutation);

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
    const response = await approvePurchaseOrder({
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
      handleApproveSuccess();
    }
  };

  const isSubmitDisabled = isApprovePurchaseOrderLoading;

  return (
    <ModalDialog
      handleClose={handleClose}
      title={"Confirm Bank Information"}
      data-cy={"review-bank-information-modal"}
    >
      <DialogContent>
        <DialogContentText>
          Please verify that your bank information below is up-to-date. This
          bank account is where Bespoke will send financing to. If the
          information is not up-to-date, please contact us.
        </DialogContentText>
        <Box>
          <BankAccountInfoCardContent bankAccount={vendorBankAccount} />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <SecondaryButton
          dataCy={"vendor-approve-po-modal-cancel-button"}
          text={"Cancel"}
          onClick={handleClose}
        />
        <PrimaryButton
          dataCy={"vendor-approve-po-modal-confirm-button"}
          isDisabled={isSubmitDisabled}
          text={"Confirm"}
          onClick={handleClickApprove}
        />
      </DialogActions>
    </ModalDialog>
  );
}

export default ReviewPurchaseOrderApproveModal;
