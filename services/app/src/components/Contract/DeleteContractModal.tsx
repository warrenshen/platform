import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { Contracts, useGetContractQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteContractMutation } from "lib/api/contracts";
import { formatDateString } from "lib/date";
import { useContext } from "react";

interface Props {
  contractId: Contracts["id"];
  handleClose: () => void;
}

export default function DeleteContractModal({
  contractId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, loading: isExistingContractLoading } = useGetContractQuery({
    fetchPolicy: "network-only",
    variables: {
      id: contractId,
    },
  });

  const contract = data?.contracts_by_pk || null;

  const [
    deleteContract,
    { loading: isDeleteContractLoading },
  ] = useCustomMutation(deleteContractMutation);

  const handleClickSubmit = async () => {
    const response = await deleteContract({
      variables: {
        contract_id: contractId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Could not delete contract. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Contract deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingContractLoading;
  const isFormLoading = isDeleteContractLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Contract"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are deleting a contract (you cannot undo this action).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following contract? You CANNOT
            undo this action.
          </Typography>
        </Box>
        {contract && (
          <>
            {isBankUser && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Customer
                </Typography>
                <Typography variant={"body1"}>
                  {contract.company?.name}
                </Typography>
              </Box>
            )}
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Contract Start Date
              </Typography>
              <Typography variant={"body1"}>
                {formatDateString(contract.start_date)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Contract Expected End Date
              </Typography>
              <Typography variant={"body1"}>
                {formatDateString(contract.end_date)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Contract Termination Date
              </Typography>
              <Typography variant={"body1"}>
                {!!contract.terminated_at
                  ? formatDateString(contract.adjusted_end_date)
                  : "TBD"}
              </Typography>
            </Box>
          </>
        )}
      </>
    </Modal>
  );
}
