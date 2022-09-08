import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Typography,
} from "@material-ui/core";
import BankAccountInfoCardNew from "components/BankAccount/BankAccountInfoCardNew";
import {
  PurchaseOrderFragment,
  RequestStatusEnum,
  useCompanyVendorPartnershipForVendorQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToPurchaseOrderApprovalRequestNewMutation } from "lib/api/purchaseOrders";
import { useContext } from "react";
import styled from "styled-components";

import { CurrentUserContext } from "../../../contexts/CurrentUserContext";

const StyledDialog = styled(Dialog)`
  padding: 32px;
`;

const StyledDialogTitle = styled.div`
  font-size: 32px;
  font-weight: 400;
  margin: 32px;
  padding: 0px;
`;

const StyledDivider = styled(Divider)`
  width: 436px;
  margin-left: 32px;
`;
const StyledDialogContent = styled(DialogContent)`
  width: 436px;
  margin: 32px;
  padding: 0px;
`;
const StyledDialogActions = styled(DialogActions)`
  margin: 32px;
  padding: 0px;
`;

interface Props {
  purchaseOrder: PurchaseOrderFragment;
  handleClose: () => void;
}

const ApprovePurchaseOrderModalNew = ({
  purchaseOrder,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();
  const { user } = useContext(CurrentUserContext);

  const { data, loading: isCompanyVendorPartnershipLoading } =
    useCompanyVendorPartnershipForVendorQuery({
      fetchPolicy: "network-only",
      variables: {
        companyId: purchaseOrder.company_id,
        vendorId: purchaseOrder.vendor_id,
      },
    });

  const [
    respondToApprovalRequestNew,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderApprovalRequestNewMutation);

  const vendorBankAccount =
    data?.company_vendor_partnerships[0]?.vendor_bank_account || null;

  const handleClickApprove = async () => {
    const response = await respondToApprovalRequestNew({
      variables: {
        purchase_order_id: purchaseOrder.id,
        new_request_status: RequestStatusEnum.Approved,
        approved_by_user_id: user.id,
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
    <StyledDialog open onClose={handleClose} maxWidth="lg">
      <StyledDialogTitle>Approve Purchase Order</StyledDialogTitle>
      <StyledDivider />
      <StyledDialogContent>
        {/* <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                Warning: you are approving a purchase order on behalf of the
                vendor (only bank admins can do this).
              </Typography>
            </Alert>
          </Box> */}
        <DialogContentText>
          Please verify that your bank information below is up-to-date. This
          bank account is where Bespoke will send financing to.
        </DialogContentText>
        <Box>
          {isCompanyVendorPartnershipLoading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : vendorBankAccount ? (
            <BankAccountInfoCardNew bankAccount={vendorBankAccount} />
          ) : (
            <Typography variant="body1">No bank account</Typography>
          )}
        </Box>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          data-cy={"approve-po-confirm-button"}
          disabled={isSubmitDisabled}
          variant={"contained"}
          color={"primary"}
          onClick={handleClickApprove}
        >
          Confirm
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default ApprovePurchaseOrderModalNew;
