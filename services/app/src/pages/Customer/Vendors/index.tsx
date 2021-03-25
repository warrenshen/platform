import { Box } from "@material-ui/core";
import Page from "components/Shared/Page";
import AddVendorButton from "components/Vendors/AddVendorButton";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useVendorPartnershipsByCompanyIdQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useContext } from "react";

function CustomerVendorsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useVendorPartnershipsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  const vendorPartnerships = sortBy(
    data?.company_vendor_partnerships || [],
    (item) => item.vendor_limited?.name
  );

  return (
    <Page appBarTitle={"Vendors"}>
      <Box display="flex" flexDirection="row-reverse">
        <AddVendorButton customerId={companyId} handleDataChange={refetch} />
      </Box>
      <Box display="flex" mt={3}>
        <VendorPartnershipsDataGrid vendorPartnerships={vendorPartnerships} />
      </Box>
    </Page>
  );
}

export default CustomerVendorsPage;
