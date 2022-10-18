import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from "@material-ui/core";
import CardLine from "components/Shared/Card/CardLine";
import {
  LoanArtifactLimitedFragment,
  LoanLimitedFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteLoanMutation } from "lib/api/loans";
import { createLoanCustomerIdentifier } from "lib/loans";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const ButtonContainer = styled.div`
  margin: 24px;
  padding: 0px;
`;

const ConfirmButton = styled(Button)`
  background-color: #e75d5d;
  color: #fff;
  margin-left: 24px;
`;

const StyledDialog = styled(Dialog)`
  padding: 32px;
`;

const StyledDialogContent = styled(DialogContent)`
  width: 436px;
  margin: 32px;
  padding: 0px;
`;

const StyledDialogTitle = styled.div`
  font-size: 32px;
  font-weight: 400px;
  margin: 24px 32px;
  padding: 0px;
`;

const StyledDivider = styled(Divider)`
  width: 436px;
  margin-left: 32px;
`;

interface Props {
  loan: LoanLimitedFragment & LoanArtifactLimitedFragment;
  handleClose: () => void;
}

function DeleteFinancingRequestModal({ loan, handleClose }: Props) {
  const snackbar = useSnackbar();

  const [deleteLoan, { loading: isDeleteLoanLoading }] =
    useCustomMutation(deleteLoanMutation);

  const handleClickConfirm = async () => {
    const response = await deleteLoan({
      variables: {
        loan_id: loan.id,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not delete financing request. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(`Financing request deleted.`);
      handleClose();
    }
  };

  return (
    <StyledDialog open onClose={handleClose}>
      <StyledDialogTitle>Delete Financing Request</StyledDialogTitle>
      <StyledDivider variant="middle" />

      <StyledDialogContent>
        <Box mb={5}>
          <Typography variant="subtitle2">
            {`Are you sure you want to delete the following financing request?`}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {`You cannot undo this action.`}
          </Typography>
        </Box>
        <CardLine
          labelText="Customer Identifer"
          valueText={createLoanCustomerIdentifier(loan)}
          labelWidth={"180px"}
        />
        {!!loan.disbursement_identifier && (
          <CardLine
            labelText="Disbursement ID"
            valueText={loan.disbursement_identifier}
            labelWidth={"180px"}
          />
        )}
        <CardLine
          labelText="Amount"
          valueText={formatCurrency(loan.amount)}
          labelWidth={"180px"}
        />
        {!!loan.line_of_credit?.recipient_vendor?.name && (
          <CardLine
            labelText="Vendor"
            valueText={loan.line_of_credit.recipient_vendor.name}
            labelWidth={"180px"}
          />
        )}
        <CardLine
          labelText="Requested payment date"
          valueText={loan.requested_payment_date}
          labelWidth={"180px"}
        />
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
