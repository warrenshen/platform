import { Box } from "@material-ui/core";
import VendorCard from "components/Vendors/VendorCard";
import { useListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";

function ListVendors() {
  const { data, loading } = useListVendorPartnershipsQuery({
    variables: {
      companyId: "57ee8797-1d5b-4a90-83c9-84c740590e42",
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
    <>
      <Box display="flex" flexWrap="wrap">
        {vendorPartnerships.map((vendorPartnership) => {
          return (
            <Box pt={2} pr={3} key={vendorPartnership.id}>
              <VendorCard vendorPartnership={vendorPartnership}></VendorCard>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export default ListVendors;
