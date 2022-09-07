import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@material-ui/core";
import { Maybe, RequestStatusEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteLoanMutation } from "lib/api/loans";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const ButtonContainer = styled.div`
  margin: 32px;
  padding: 0px;
`;

const ConfirmButton = styled(Button)`
  background-color: #e75d5d;
  color: #fff;
  margin-left: 24px;
`;

const Label = styled.span`
  width: 174px;
  color: #abaaa9;
`;

const StyledDialog = styled(Dialog)`
  padding: 32px;
`;

const StyledDialogContent = styled(DialogContent)`
  width: 436px;
  margin: 32px;
  padding: 0px;
`;

const StyledDialogTitle = styled(DialogTitle)`
  font-size: 32px;
  font-weight: 400px;
  margin: 32px;
  padding: 0px;
`;

const StyledDivider = styled(Divider)`
  width: 436px;
  margin-left: 32px;
`;

interface Props {
  loanId: string;
  loanStatus: Maybe<string> | undefined;
  companyName: string;
  purchaseOrderNumber: string;
  disbursementId: Maybe<string> | undefined;
  requestedAmount: number;
  handleClose: () => void;
  deleteFinancingRequestFromState: () => void;
  // handleClickConfirm: () => void;
}

function DeleteFinancingRequestModal({
  loanId,
  loanStatus,
  companyName,
  purchaseOrderNumber,
  disbursementId,
  requestedAmount,
  handleClose,
  deleteFinancingRequestFromState,
}: // handleClickConfirm,
Props) {
  const snackbar = useSnackbar();

  const [deleteLoan, { loading: isDeleteLoanLoading }] =
    useCustomMutation(deleteLoanMutation);

  const handleClickConfirm = async () => {
    if (loanStatus === RequestStatusEnum.Drafted) {
      deleteFinancingRequestFromState();
      snackbar.showSuccess(`Financing request deleted.`);
      handleClose();
      return;
    }

    const response = await deleteLoan({
      variables: {
        loan_id: loanId,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not delete financing request. Error: ${response.msg}`
      );
    } else {
      deleteFinancingRequestFromState();
      snackbar.showSuccess(`Financing request deleted.`);
      handleClose();
    }
  };

  return (
    <StyledDialog open onClose={handleClose}>
      <StyledDialogTitle>Delete Financing Request</StyledDialogTitle>
      <StyledDivider variant="middle" />

      <StyledDialogContent>
        <Box mb={2}>
          <Typography variant="subtitle2">
            {`Are you sure you want to delete the following financing request?`}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {`You cannot undo this action.`}
          </Typography>
        </Box>
        <Box display="flex" pb={2} pt={2}>
          <Label>Company</Label>
          <Typography variant="body2">{companyName}</Typography>
        </Box>
        <Box display="flex" pb={2}>
          <Label>PO Number</Label>
          <Typography variant="body2">{purchaseOrderNumber}</Typography>
        </Box>
        <Box display="flex" pb={2}>
          <Label>Disbursement ID</Label>
          <Typography variant="body2">{disbursementId}</Typography>
        </Box>
        <Box display="flex" pb={2}>
          <Label>Amount</Label>
          <Typography variant="body2">
            {formatCurrency(requestedAmount)}
          </Typography>
        </Box>
      </StyledDialogContent>
      <DialogActions>
        <ButtonContainer>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <ConfirmButton
            disabled={isDeleteLoanLoading}
            onClick={() => {
              handleClickConfirm();
              // deleteLoanMutation()
            }}
            variant="contained"
          >
            Confirm
          </ConfirmButton>
        </ButtonContainer>
      </DialogActions>
    </StyledDialog>
  );
}

export default DeleteFinancingRequestModal;
