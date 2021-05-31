import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  EbbaApplications,
  useGetEbbaApplicationQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteEbbaApplicationMutation } from "lib/api/ebbaApplications";
import { formatCurrency } from "lib/currency";
import { useContext } from "react";

interface Props {
  ebbaApplicationId: EbbaApplications["id"];
  handleClose: () => void;
}

export default function DeleteEbbaApplicationModal({
  ebbaApplicationId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const {
    data,
    loading: isExistingEbbaApplicationLoading,
  } = useGetEbbaApplicationQuery({
    fetchPolicy: "network-only",
    variables: {
      id: ebbaApplicationId,
    },
  });

  const ebbaApplication = data?.ebba_applications_by_pk || null;

  const [
    deleteEbbaApplication,
    { loading: isDeleteEbbaApplicationLoading },
  ] = useCustomMutation(deleteEbbaApplicationMutation);

  const handleClickSubmit = async () => {
    const response = await deleteEbbaApplication({
      variables: {
        ebba_application_id: ebbaApplicationId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Error! Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Borrowing base deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingEbbaApplicationLoading;
  const isFormLoading = isDeleteEbbaApplicationLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Borrowing Base Certification"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are deleting a borrowing base certification on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following borrowing base
            certification? You CANNOT undo this action.
          </Typography>
        </Box>
        {ebbaApplication && (
          <>
            {isBankUser && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Customer
                </Typography>
                <Typography variant={"body1"}>
                  {ebbaApplication.company?.name}
                </Typography>
              </Box>
            )}
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Application Date
              </Typography>
              <Typography variant={"body1"}>
                {ebbaApplication.application_date}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Montly Accounts Receivable
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.monthly_accounts_receivable)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Current Month Inventory
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.monthly_inventory)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Current Month Cash
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.monthly_cash)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Current Month Cash in DACA
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.amount_cash_in_daca)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Calculated Borrowing Base
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.calculated_borrowing_base)}
              </Typography>
            </Box>
          </>
        )}
      </>
    </Modal>
  ) : null;
}
