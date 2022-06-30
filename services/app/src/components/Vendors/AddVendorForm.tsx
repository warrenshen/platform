import { Box, TextField } from "@material-ui/core";
import { AddVendorInput } from "components/Vendors/AddVendorNewModal";
import { isEmailValid } from "lib/validation";

interface Props {
  vendorInput: AddVendorInput;
  setVendorInput: (vendorInput: AddVendorInput) => void;
}

export default function AddVendorForm({ vendorInput, setVendorInput }: Props) {
  return (
    <Box my={2}>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            label="Vendor Name"
            required
            value={vendorInput.name}
            onChange={({ target: { value } }) => {
              setVendorInput({ ...vendorInput, name: value });
            }}
          />
          <TextField
            label="Vendor Email"
            required
            value={vendorInput.email}
            error={!!vendorInput.email && !isEmailValid(vendorInput.email)}
            onChange={({ target: { value } }) => {
              setVendorInput({ ...vendorInput, email: value });
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
