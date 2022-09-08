import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  TextField,
} from "@material-ui/core";
import { RequestStatusEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToPurchaseOrderApprovalRequestMutation } from "lib/api/purchaseOrders";
import { useContext, useState } from "react";
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

const StytledDivider = styled(Divider)`
  color: #e5e4e1;
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
  purchaseOrderId: string;
  handleClose: () => void;
}

const RejectPurchaseOrderModalNew = ({
  purchaseOrderId,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();
  const { user } = useContext(CurrentUserContext);

  const [rejectionNote, setRejectionNote] = useState("");

  const [
    respondToApprovalRequest,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderApprovalRequestMutation);

  const handleClickReject = async () => {
    const response = await respondToApprovalRequest({
      variables: {
        purchase_order_id: purchaseOrderId,
        new_request_status: RequestStatusEnum.Rejected,
        rejected_by_user_id: user.id,
        rejection_note: rejectionNote,
        link_val: null,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Something went wrong. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Purchase order rejected.");
      handleClose();
    }
  };

  const isSubmitDisabled = !rejectionNote || isRespondToApprovalRequestLoading;

  return (
    <StyledDialog open onClose={handleClose} maxWidth="lg">
      <StyledDialogTitle>Reject Completely</StyledDialogTitle>
      <StytledDivider />
      <StyledDialogContent>
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
          />
        </Box>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitDisabled}
          variant={"contained"}
          color={"primary"}
          onClick={handleClickReject}
        >
          Confirm
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default RejectPurchaseOrderModalNew;
