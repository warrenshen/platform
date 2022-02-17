import { Box, FormControl, Typography } from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import AutocompleteDebtFacility from "components/DebtFacility/AutocompleteDebtFacility";
import { updateDebtFacilityCapacity } from "lib/api/debtFacility";
import { formatCurrency } from "lib/number";
import { useState } from "react";

interface Props {
  currentCapacity: number;
  handleClose: () => void;
}

export default function UpdateDebtFacilityCapacityModal({
  currentCapacity,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [newCapacity, setNewCapacity] = useState(0);
  const [debtFacility, setDebtFacility] = useState("");

  const [
    updateCapacity,
    { loading: isUpdateCapacityLoading },
  ] = useCustomMutation(updateDebtFacilityCapacity);

  // Submission Handler
  const handleClick = async () => {
    const response = await updateCapacity({
      variables: {
        newCapacity: newCapacity,
        debtFacilityId: debtFacility,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully updated the debt facility capacity");
      handleClose();
    }
  };

  // Finally, actually render the one we'd like rendered
  return (
    <Modal
      dataCy={"update-debt-facility-capacity-modal"}
      isPrimaryActionDisabled={
        isUpdateCapacityLoading || !debtFacility || newCapacity === 0
      }
      title={"Update Debt Facility Capacity"}
      contentWidth={800}
      primaryActionText={"Submit New Capacity"}
      handleClose={handleClose}
      handlePrimaryAction={() => handleClick()}
    >
      <Box mt={4}>
        <Typography variant="body2" color="textSecondary">
          Current Debt Facility Capacity
        </Typography>
        <Typography variant="body1">
          {formatCurrency(currentCapacity)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={1}>
        <FormControl>
          <CurrencyInput
            label={"Debt Facility Capacity"}
            value={newCapacity}
            handleChange={(value) => setNewCapacity(value ? value : 0)}
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={1}>
        <AutocompleteDebtFacility
          textFieldLabel="Select existing debt facility by name"
          onChange={(selectedDebtFacility) => {
            setDebtFacility(selectedDebtFacility);
          }}
        />
      </Box>
    </Modal>
  );
}
