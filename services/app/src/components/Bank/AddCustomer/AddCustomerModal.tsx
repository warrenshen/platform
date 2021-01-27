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
  BankCustomersDocument,
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ProductTypeEnum,
  useAddCustomerMutation,
} from "generated/graphql";
import { ProductTypeLabel } from "lib/enum";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

function AddCustomerModal(props: Props) {
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
    <Dialog open onClose={props.onClose}>
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
                    {ProductTypeLabel[productType]}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button>Cancel</Button>
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
                  query: BankCustomersDocument,
                },
              ],
            });
            props.onClose();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCustomerModal;
