import { Box } from "@material-ui/core";
import VendorCard from "components/Vendors/VendorCard";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useContext } from "react";

function ListVendors() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);
  const { data } = useListVendorPartnershipsQuery({
    variables: {
      companyId,
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
    <Box display="flex" flexWrap="wrap">
      {vendorPartnerships.map((vendorPartnership) => {
        return (
          <Box pt={2} pr={3} key={vendorPartnership.id}>
            <VendorCard vendorPartnership={vendorPartnership}></VendorCard>
          </Box>
        );
      })}
    </Box>
  );
}

export default ListVendors;
