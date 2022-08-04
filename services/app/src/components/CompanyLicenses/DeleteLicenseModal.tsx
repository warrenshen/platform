import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteLicenseMutation } from "lib/api/licenses";
import { useContext } from "react";

interface Props {
  licenseId: string;
  handleClose: () => void;
}

export default function DeleteLicenseModal({ licenseId, handleClose }: Props) {
  const snackbar = useSnackbar();

  const [deleteLicense, { loading: isDeleteLicenseLoading }] =
    useCustomMutation(deleteLicenseMutation);

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const handleSubmit = async () => {
    const response = await deleteLicense({
      variables: {
        license_id: licenseId,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("License deleted.");
      handleClose();
    }
  };

  return (
    <Modal
      dataCy={"delete-license-modal"}
      isPrimaryActionDisabled={isDeleteLicenseLoading}
      title={"Delete License"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleSubmit}
    >
      <>
        {isBankUser ? (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are about to delete the license on behalf of this
              customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        ) : null}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following license?
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            {licenseId}
          </Typography>
        </Box>
      </>
    </Modal>
  );
}
