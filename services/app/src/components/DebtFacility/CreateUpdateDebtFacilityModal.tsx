import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  TextField,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { DebtFacilityFragment } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { formatCurrency } from "lib/number";
import { createUpdateDebtFacility } from "lib/api/debtFacility";
import { ChangeEvent, useState } from "react";

interface Props {
  isUpdate: boolean;
  currentName?: string;
  selectedDebtFacility: DebtFacilityFragment | null;
  handleClose: () => void;
}

export default function CreateUpdateDebtFacilityModal({
  isUpdate,
  currentName = "",
  selectedDebtFacility,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [debtFacilityName, setDebtFacilityName] = useState(
    isUpdate ? currentName : ""
  );

  const [newMaximumCapacity, setNewMaximumCapacity] = useState(
    !!selectedDebtFacility?.maximum_capacities[0]?.amount
      ? selectedDebtFacility.maximum_capacities[0].amount
      : 0
  );
  const [newDrawnCapacity, setNewDrawnCapacity] = useState(
    !!selectedDebtFacility?.drawn_capacities[0]?.amount
      ? selectedDebtFacility.drawn_capacities[0].amount
      : 0
  );

  const supportedProductTypes =
    selectedDebtFacility?.product_types["supported"] || [];
  const [selectionState, setSelectionState] = useState<Record<string, boolean>>(
    {
      [ProductTypeEnum.DispensaryFinancing]: supportedProductTypes.includes(
        ProductTypeEnum.DispensaryFinancing
      ),
      [ProductTypeEnum.InventoryFinancing]: supportedProductTypes.includes(
        ProductTypeEnum.InventoryFinancing
      ),
      [ProductTypeEnum.InvoiceFinancing]: supportedProductTypes.includes(
        ProductTypeEnum.InvoiceFinancing
      ),
      [ProductTypeEnum.LineOfCredit]: supportedProductTypes.includes(
        ProductTypeEnum.LineOfCredit
      ),
      [ProductTypeEnum.PurchaseMoneyFinancing]: supportedProductTypes.includes(
        ProductTypeEnum.PurchaseMoneyFinancing
      ),
    }
  );

  const [
    createUpdateFacility,
    { loading: isUpdateFacilityLoading },
  ] = useCustomMutation(createUpdateDebtFacility);

  // Submission Handler
  const handleClick = async () => {
    // generate list of product types based on if checkbox selected
    const selectedProducts = Object.entries(selectionState)
      .map((state) => {
        return state[1] ? state[0] : null;
      })
      .filter((state) => !!state);
    const response = await createUpdateFacility({
      variables: {
        isUpdate: isUpdate,
        name: debtFacilityName,
        id: selectedDebtFacility?.id || "",
        supported: selectedProducts,
        newMaximumCapacity: newMaximumCapacity,
        newDrawnCapacity: newDrawnCapacity,
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

  const currentMaximumCapacity = !!selectedDebtFacility?.maximum_capacities[0]
    ?.amount
    ? formatCurrency(selectedDebtFacility.maximum_capacities[0].amount)
    : "Not Set Yet";

  const currentDrawnCapacity = !!selectedDebtFacility?.drawn_capacities[0]
    ?.amount
    ? formatCurrency(selectedDebtFacility.drawn_capacities[0].amount)
    : "Not Set Yet";

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
          <Typography variant="body1">
            {selectedDebtFacility?.name || ""}
          </Typography>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="body2" color="textSecondary">
          Debt Facility Name
        </Typography>
        <Box>
          <FormControl>
            <TextField
              label={"Name"}
              value={debtFacilityName}
              onChange={({ target: { value } }) => setDebtFacilityName(value)}
            />
          </FormControl>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body2" color="textSecondary">
          Current Maximum Capacity
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {currentMaximumCapacity}
        </Typography>
        <Box mt={2}>
          <FormControl>
            <CurrencyInput
              label={"New Maximum Capacity"}
              value={newMaximumCapacity}
              handleChange={(value) => setNewMaximumCapacity(value ? value : 0)}
            />
          </FormControl>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body2" color="textSecondary">
          Current Drawn Capacity
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {currentDrawnCapacity}
        </Typography>
        <Box mt={2}>
          <FormControl>
            <CurrencyInput
              label={"New Drawn Capacity"}
              value={newDrawnCapacity}
              handleChange={(value) => setNewDrawnCapacity(value ? value : 0)}
            />
          </FormControl>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body2" color="textSecondary">
          Supported Product Types
        </Typography>
        <List component="div">
          {Object.entries(ProductTypeEnum).map(([key, value]) =>
            value !== ProductTypeEnum.None ? (
              <ListItem key={value} value={value}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectionState[value]}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setSelectionState({
                          ...selectionState,
                          [value]: event.target.checked,
                        });
                      }}
                      color="primary"
                    />
                  }
                  label={ProductTypeToLabel[value as ProductTypeEnum]}
                />
              </ListItem>
            ) : (
              <></>
            )
          )}
        </List>
      </Box>
    </Modal>
  );
}
