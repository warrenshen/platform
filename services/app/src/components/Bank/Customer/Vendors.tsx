import { Box } from "@material-ui/core";
import { CustomerParams } from "components/Bank/Customer";
import AddButton from "components/Vendors/AddVendor/Button";
import ClickableVendorCard from "components/Vendors/Bank/ClickableVendorCard";
import { useBankCustomerListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useParams } from "react-router-dom";

function Vendors() {
  const { companyId } = useParams<CustomerParams>();
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
    <>
      <Box display="flex" flexDirection="row-reverse">
        <AddButton></AddButton>
      </Box>
      <Box display="flex" flexWrap="wrap">
        {vendorPartnerships.map((vendorPartnership) => {
          return (
            <Box pr={3} key={vendorPartnership.id}>
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

export default Vendors;
