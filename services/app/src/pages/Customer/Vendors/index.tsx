import { Box } from "@material-ui/core";
import Page from "components/Shared/Page";
import AddButton from "components/Vendors/AddVendor/Button";
import ListVendors from "components/Vendors/Customer/ListVendors";

function CustomerVendorsPage() {
  return (
    <Page>
      <Box display="flex" flexDirection="row-reverse">
        <AddButton></AddButton>
      </Box>
      <ListVendors></ListVendors>
    </Page>
  );
}

export default CustomerVendorsPage;
