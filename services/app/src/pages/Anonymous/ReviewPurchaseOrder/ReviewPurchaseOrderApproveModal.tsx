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
import BankAccountInfoCard from "components/Shared/BankAccount/BankAccountInfoCard";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  PurchaseOrderFragment,
  RequestStatusEnum,
  useCompanyVendorPartnershipForVendorQuery,
} from "generated/graphql";
import { authenticatedApi, purchaseOrdersRoutes } from "lib/api";
import { useContext } from "react";

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
  purchaseOrder: PurchaseOrderFragment;
  linkVal: string; // the link value used to generate this one-time reject ability
  handleClose: () => void;
  handleApproveSuccess: () => void;
}

function ReviewPurchaseOrderApproveModal({
  purchaseOrder,
  linkVal,
  handleClose,
  handleApproveSuccess,
}: Props) {
  const classes = useStyles();
  const { user } = useContext(CurrentUserContext);

  const { data } = useCompanyVendorPartnershipForVendorQuery({
    variables: {
      companyId: purchaseOrder.company_id,
      vendorId: user.companyId,
    },
  });

  if (!data?.company_vendor_partnerships[0]?.vendor_bank_account) {
    return null;
  }

  const vendorBankAccount = data.company_vendor_partnerships[0]
    .vendor_bank_account as BankAccountFragment;

  const handleClickApprove = async () => {
    const response = await authenticatedApi.post(
      purchaseOrdersRoutes.respondToApprovalRequest,
      {
        purchase_order_id: purchaseOrder.id,
        new_request_status: RequestStatusEnum.Approved,
        rejection_note: "",
        link_val: linkVal,
      }
    );
    if (response.data?.status === "ERROR") {
      alert(response.data?.msg);
    } else {
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
        Confirm Bank Information
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please verify that your bank information below is up-to-date. This
          account is where Bespoke may send an advance to in the future. If the
          information is not up-to-date, please contact us. Otherwise, press the
          "Confirm" button below.
        </DialogContentText>
        <Box>
          <BankAccountInfoCard
            isEditAllowed={false}
            isVerificationVisible={false}
            bankAccount={vendorBankAccount}
          ></BankAccountInfoCard>
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

export default ReviewPurchaseOrderApproveModal;
