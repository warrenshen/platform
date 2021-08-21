import { Box, TextField } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { useGetVendorPartnershipsForBankQuery } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { filter, sortBy } from "lodash";
import { useMemo, useState } from "react";

export default function BankVendorsPage() {
  const { data } = useGetVendorPartnershipsForBankQuery({
    fetchPolicy: "network-only",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const vendorPartnerships = useMemo(() => {
    const filteredVendorPartnerships = filter(
      data?.company_vendor_partnerships || [],
      (vendorPartnership) =>
        getCompanyDisplayName(vendorPartnership.vendor)
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredVendorPartnerships, (vendorPartnership) =>
      getCompanyDisplayName(vendorPartnership.vendor)
    );
  }, [searchQuery, data?.company_vendor_partnerships]);

  return (
    <Page appBarTitle={"Vendors"}>
      <PageContent title={"Vendors"}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by vendor name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 300 }}
            />
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <VendorPartnershipsDataGrid
            isRoleBankUser
            vendorPartnerships={vendorPartnerships}
          />
        </Box>
      </PageContent>
    </Page>
  );
}
