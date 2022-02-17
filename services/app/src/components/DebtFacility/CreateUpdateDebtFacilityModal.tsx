import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateDebtFacility } from "lib/api/debtFacility";
import { useState } from "react";

interface Props {
  isUpdate: boolean;
  currentName?: string;
  currentId?: string;
  handleClose: () => void;
}

export default function CreateUpdateDebtFacilityModal({
  isUpdate,
  currentName = "",
  currentId = "",
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [debtFacilityName, setDebtFacilityName] = useState(
    isUpdate ? currentName : ""
  );

  const [
    createUpdateFacility,
    { loading: isUpdateFacilityLoading },
  ] = useCustomMutation(createUpdateDebtFacility);

  // Submission Handler
  const handleClick = async () => {
    const response = await createUpdateFacility({
      variables: {
        isUpdate: isUpdate,
        name: debtFacilityName,
        id: currentId,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      const successMessage = isUpdate
        ? "Successfully updated the debt facility"
        : "Successfully created the debt facility";
      snackbar.showSuccess(successMessage);
      handleClose();
    }
  };

  // Finally, actually render the one we'd like rendered
  return (
    <Modal
      dataCy={"update-debt-facility-capacity-modal"}
      isPrimaryActionDisabled={isUpdateFacilityLoading}
      title={isUpdate ? "Update Debt Facility" : "Create Debt Facility"}
      contentWidth={800}
      primaryActionText={isUpdate ? "Submit Edits" : "Submit Debt Facility"}
      handleClose={handleClose}
      handlePrimaryAction={() => handleClick()}
    >
      {isUpdate && (
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Selected Debt Facility
          </Typography>
          <Typography variant="body1">PLACEHOLDER</Typography>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={1}>
        <Typography variant="body2" color="textSecondary">
          Debt Facility Name
        </Typography>
        <FormControl>
          <TextField
            label={"Name"}
            value={debtFacilityName}
            onChange={({ target: { value } }) => setDebtFacilityName(value)}
          />
        </FormControl>
      </Box>
    </Modal>
  );
}
