import { Box, TextField } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import {
  Companies,
  useGetVendorPartnershipsByVendorIdQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { filter, sortBy } from "lodash";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerVendorPartnershipsSubpage({
  companyId,
}: Props) {
  const { data } = useGetVendorPartnershipsByVendorIdQuery({
    fetchPolicy: "network-only",
    variables: {
      vendor_id: companyId,
    },
  });

  const [searchQuery, setSearchQuery] = useState("");

  const vendorPartnerships = useMemo(() => {
    const filteredVendorPartnerships = filter(
      data?.company_vendor_partnerships || [],
      (vendorPartnership) =>
        (!!vendorPartnership.vendor
          ? getCompanyDisplayName(vendorPartnership.vendor)
          : ""
        )
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(
      filteredVendorPartnerships,
      (vendorPartnership) => vendorPartnership.vendor?.name || null
    );
  }, [searchQuery, data?.company_vendor_partnerships]);

  return (
    <PageContent title={"Vendor Partnerships"}>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        justifyContent="space-between"
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
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
  );
}
