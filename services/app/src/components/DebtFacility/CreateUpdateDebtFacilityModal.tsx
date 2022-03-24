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
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { DebtFacilities } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { createUpdateDebtFacility } from "lib/api/debtFacility";
import { ChangeEvent, useState } from "react";

interface Props {
  isUpdate: boolean;
  currentName?: string;
  selectedDebtFacility: DebtFacilities | null;
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
          <Typography variant="body1">
            {selectedDebtFacility?.name || ""}
          </Typography>
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
      <Box display="flex" flexDirection="column" mt={1}>
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
                        console.log(event.target.checked);
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
