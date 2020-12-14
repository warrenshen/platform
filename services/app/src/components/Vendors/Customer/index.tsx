import { Box } from "@material-ui/core";
import AddButton from "components/Vendors/Customer/AddVendor/Button";
import ListVendors from "components/Vendors/Customer/ListVendors";

function Vendors() {
  return (
    <>
      <Box display="flex" flexDirection="row-reverse">
        <AddButton></AddButton>
      </Box>
      <ListVendors></ListVendors>
    </>
  );
}

export default Vendors;
