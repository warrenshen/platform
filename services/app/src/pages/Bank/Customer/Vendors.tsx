import { Box } from "@material-ui/core";
import AddButton from "components/Vendors/AddVendor/Button";
import { useBankCustomerListVendorPartnershipsQuery } from "generated/graphql";
import VendorPartnershipList from "components/Vendors/VendorPartnershipList";
import { sortBy } from "lodash";

interface Props {
  companyId: string;
}

function Vendors({ companyId }: Props) {
  const { data } = useBankCustomerListVendorPartnershipsQuery({
    variables: {
      companyId: companyId,
    },
  });

  if (!data || !data.company_vendor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_vendor_partnerships,
    (item) => item.vendor.name
  );
  return (
    <Box>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        flexDirection="row-reverse"
      >
        <AddButton></AddButton>
      </Box>
      <Box display="flex" flexWrap="wrap">
        <VendorPartnershipList
          isDrilldownByCustomer
          data={vendorPartnerships}
          isBankAccount
        />
      </Box>
    </Box>
  );
}

export default Vendors;
