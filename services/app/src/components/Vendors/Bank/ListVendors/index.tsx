import { Box, Drawer } from "@material-ui/core";
import ClickableVendorCard from "components/Vendors/Bank/ClickableVendorCard";
import { useBankListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";

function ListVendors() {
  const { data, loading } = useBankListVendorPartnershipsQuery();

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
              <ClickableVendorCard
                vendorPartnership={vendorPartnership}
              ></ClickableVendorCard>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export default ListVendors;
