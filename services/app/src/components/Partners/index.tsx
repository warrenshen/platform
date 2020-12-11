import { Box } from "@material-ui/core";
import AddButton from "components/Partners/AddVendor/Button";
import ListVendors from "components/Partners/ListVendors";
import { useTitle } from "react-use";

function Partners() {
  useTitle("Partners | Bespoke");
  return (
    <Box>
      <AddButton></AddButton>
      <ListVendors></ListVendors>
    </Box>
  );
}

export default Partners;
