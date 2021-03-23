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

  const { data } = useVendorPartnershipsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  if (!data?.company_vendor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_vendor_partnerships,
    (item) => item.vendor_limited?.name
  );

  return (
    <Page appBarTitle={"Vendors"}>
      <Box display="flex" flexDirection="row-reverse">
        <AddVendorButton companyId={companyId} handleDataChange={() => {}} />
      </Box>
      <VendorPartnershipsDataGrid vendorPartnerships={vendorPartnerships} />
    </Page>
  );
}

export default CustomerVendorsPage;
