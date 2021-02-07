import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  CustomersForBankDocument,
  ProductTypeEnum,
  useAddCustomerMutation,
} from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { useState } from "react";

interface Props {
  handleClose: () => void;
}

function AddCustomerModal({ handleClose }: Props) {
  const [customer, setCustomer] = useState<CompaniesInsertInput>({});
  const [
    companySetting,
    setCompanySetting,
  ] = useState<CompanySettingsInsertInput>({});
  const [
    addCustomer,
    { loading: addCustomerLoading },
  ] = useAddCustomerMutation();

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Add Customer</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" mb={6}>
          <Box>
            <TextField
              label="Company Name"
              value={customer.name || ""}
              onChange={({ target: { value } }) => {
                setCustomer({ ...customer, name: value });
              }}
            ></TextField>
          </Box>
          <Box mt={4}>
            <Select
              value={companySetting.product_type || ""}
              onChange={({ target: { value } }) => {
                setCompanySetting({
                  product_type: value as ProductTypeEnum,
                });
              }}
              style={{ width: 200 }}
            >
              {[
                ProductTypeEnum.InventoryFinancing,
                ProductTypeEnum.InvoiceFinancing,
                ProductTypeEnum.LineOfCredit,
                ProductTypeEnum.PurchaseMoneyFinancing,
              ].map((productType) => {
                return (
                  <MenuItem key={productType} value={productType}>
                    {ProductTypeToLabel[productType]}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={addCustomerLoading}
          onClick={async () => {
            await addCustomer({
              variables: {
                customer: {
                  ...customer,
                  settings: {
                    data: {
                      ...companySetting,
                    },
                  },
                },
              },
              refetchQueries: [
                {
                  query: CustomersForBankDocument,
                },
              ],
            });
            handleClose();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCustomerModal;
