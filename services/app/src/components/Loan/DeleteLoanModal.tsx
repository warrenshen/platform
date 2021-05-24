import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { Loans, useGetLoanQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteLoanMutation } from "lib/api/loans";
import { formatCurrency } from "lib/currency";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { useContext } from "react";

interface Props {
  loanId: Loans["id"] | null;
  handleClose: () => void;
}

export default function DeleteLoanModal({ loanId, handleClose }: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, loading: isExistingLoanLoading } = useGetLoanQuery({
    fetchPolicy: "network-only",
    variables: {
      id: loanId,
    },
  });

  const loan = data?.loans_by_pk || null;

  const [deleteLoan, { loading: isDeleteLoanLoading }] = useCustomMutation(
    deleteLoanMutation
  );

  const handleClickSubmit = async () => {
    const response = await deleteLoan({
      variables: {
        loan_id: loanId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Loan deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormLoading = isDeleteLoanLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Loan"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are deleting a loan on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following loan? You CANNOT undo
            this action.
          </Typography>
        </Box>
        {loan && (
          <>
            {isBankUser && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Company
                </Typography>
                <Typography variant={"body1"}>{loan.company?.name}</Typography>
              </Box>
            )}
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Identifier
              </Typography>
              <Typography variant={"body1"}>
                {createLoanCustomerIdentifier(loan)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Disbursement Identifier
              </Typography>
              <Typography variant={"body1"}>
                {createLoanDisbursementIdentifier(loan)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Requested Amount
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(loan.amount)}
              </Typography>
            </Box>
          </>
        )}
      </>
    </Modal>
  ) : null;
}
