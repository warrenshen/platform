import { Box } from "@material-ui/core";
import { CustomerParams } from "components/Bank/Customer";
import ClickableVendorCard from "components/Vendors/Bank/ClickableVendorCard";
import { useBankCustomerListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useParams } from "react-router-dom";

function Vendors() {
  const { customerId } = useParams<CustomerParams>();
  const { data } = useBankCustomerListVendorPartnershipsQuery({
    variables: {
      companyId: customerId,
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
