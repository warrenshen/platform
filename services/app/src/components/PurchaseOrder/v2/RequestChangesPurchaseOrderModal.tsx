import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import { RequestStatusEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { respondToPurchaseOrderApprovalRequestMutation } from "lib/api/purchaseOrders";
import { useContext, useState } from "react";
import styled from "styled-components";

import { CurrentUserContext } from "../../../contexts/CurrentUserContext";

const StyledCheckbox = styled(Checkbox)`
  margin-left: 8px;
`;

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

const StyledFormControlLabel = styled(FormControlLabel)`
  margin-top: 16px;
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

  const [changesNote, setChangesNote] = useState("");
  const [requireVendorApproval, setRequireVendorApproval] =
    useState<boolean>(false);

  const [
    respondToApprovalRequest,
    { loading: isRespondToApprovalRequestLoading },
  ] = useCustomMutation(respondToPurchaseOrderApprovalRequestMutation);

  const handleClickRequestChanges = async () => {
    // TODO: implement API endpoint to handle request changes
    const response = await respondToApprovalRequest({
      variables: {
        purchase_order_id: purchaseOrderId,
        new_request_status: RequestStatusEnum.Rejected,
        rejected_by_user_id: user.id,
        rejection_note: changesNote,
        requires_vendor_approval: requireVendorApproval,
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

  const isSubmitDisabled = !changesNote || isRespondToApprovalRequestLoading;

  return (
    <StyledDialog open onClose={handleClose} maxWidth="lg">
      <StyledDialogTitle>Request Changes</StyledDialogTitle>
      <StytledDivider />
      <StyledDialogContent>
        <DialogContentText>
          Please enter in a reason for why the purchase order is incomplete.
          After you are finished, press the "Confirm" button below.
        </DialogContentText>
        <Box display="flex" flexDirection="column">
          <TextField
            multiline
            label={"Changes"}
            placeholder={"Changes"}
            value={changesNote}
            onChange={({ target: { value } }) => setChangesNote(value)}
          />
          <StyledFormControlLabel
            label="Do changes require vendor approval?"
            control={
              <StyledCheckbox
                color="primary"
                icon={<CustomCheckboxUnchecked />}
                checkedIcon={<CustomCheckboxChecked />}
                onChange={(event) =>
                  setRequireVendorApproval(event.target.checked)
                }
              />
            }
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
          onClick={handleClickRequestChanges}
        >
          Confirm
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default RejectPurchaseOrderModalNew;
