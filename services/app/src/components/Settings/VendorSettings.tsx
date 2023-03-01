import { Box } from "@material-ui/core";
import ManageUsersArea from "components/Settings/ManageUsersArea";
import { GetCompanyForVendorQuery } from "generated/graphql";

interface Props {
  company: NonNullable<GetCompanyForVendorQuery["companies_by_pk"]>;
  settings: NonNullable<
    GetCompanyForVendorQuery["companies_by_pk"]
  >["settings"];
}

const VendorSettings = ({ company, settings }: Props) => {
  return (
    <Box mt={4}>
      <ManageUsersArea company={company} isVendorOrActiveCustomer />
    </Box>
  );
};

export default VendorSettings;
