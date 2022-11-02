import {
  Box,
  DialogActions,
  DialogContent,
  Typography,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import PrimaryWarningButton from "components/Shared/Button/PrimaryWarningButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import CardLine from "components/Shared/Card/CardLine";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { archiveLoanMutation, unarchiveLoanMutation } from "lib/api/loans";
import { Action } from "lib/auth/rbac-rules";
import { createLoanCustomerIdentifier } from "lib/loans";
import { formatCurrency } from "lib/number";

interface Props {
  loan: any;
  action: Action;
  isFinancingRequest: boolean;
  handleClose: () => void;
}

function ArchiveLoanModal({
  loan,
  action,
  isFinancingRequest,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [archiveLoan, { loading: isArchiveLoanLoading }] =
    useCustomMutation(archiveLoanMutation);

  const [unarchiveLoan, { loading: isUnarchiveLoanLoading }] =
    useCustomMutation(unarchiveLoanMutation);

  const handleClickConfirm = async () => {
    let response;
    if (action === Action.ArchiveLoan) {
      response = await archiveLoan({
        variables: {
          loan_id: loan.id,
          company_id: loan.company_id,
        },
      });
    } else {
      response = await unarchiveLoan({
        variables: {
          loan_id: loan.id,
          company_id: loan.company_id,
        },
      });
    }
    if (response.status !== "OK") {
      snackbar.showError(
        `Could not ${action === Action.ArchiveLoan ? "" : "un"}archive ${
          isFinancingRequest ? "financing request" : "loan"
        }. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        `${isFinancingRequest ? "Financing request" : "Loan"} ${
          action === Action.ArchiveLoan ? "" : "un"
        }archived.`
      );
      handleClose();
    }
  };

  return (
    <ModalDialog
      title={`${action === Action.ArchiveLoan ? "Archive" : "Unarchive"} ${
        isFinancingRequest ? "Financing Request" : "Loan"
      }`}
      handleClose={handleClose}
    >
      <DialogContent>
        <Box mb={4}>
          <Typography variant="subtitle2">
            {`Are you sure you want to ${
              action === Action.ArchiveLoan ? "archive" : "unarchive"
            } the following ${
              isFinancingRequest ? "financing request" : "loan"
            }?`}
          </Typography>
        </Box>
        {loan && (
          <Box>
            <CardLine
              labelText="Company"
              valueText={loan.company.name}
              valueAlignment="left"
            />
            <CardLine
              labelText="Identifier"
              valueText={createLoanCustomerIdentifier(loan)}
              valueAlignment="left"
            />
            <CardLine
              labelText="Requested amount"
              valueText={formatCurrency(loan.amount)}
              valueAlignment="left"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box display="flex" style={{ margin: 32, padding: 0 }}>
          <SecondaryButton
            dataCy={"archive-loan-cancel-button"}
            text={"Cancel"}
            onClick={handleClose}
          />
          {action === Action.ArchiveLoan ? (
            <PrimaryWarningButton
              dataCy={"archive-loan-confirm-button"}
              isDisabled={isArchiveLoanLoading || isUnarchiveLoanLoading}
              text={"Confirm"}
              onClick={handleClickConfirm}
            />
          ) : (
            <PrimaryButton
              dataCy={"archive-loan-confirm-button"}
              isDisabled={isArchiveLoanLoading || isUnarchiveLoanLoading}
              text={"Confirm"}
              onClick={handleClickConfirm}
            />
          )}
        </Box>
      </DialogActions>
    </ModalDialog>
  );
}

export default ArchiveLoanModal;
