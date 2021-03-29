import { Box, TextField } from "@material-ui/core";
import Page from "components/Shared/Page";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { useGetVendorPartnershipsForBankQuery } from "generated/graphql";
import { filter, sortBy } from "lodash";
import { useMemo, useState } from "react";

function BankVendorsPage() {
  const { data } = useGetVendorPartnershipsForBankQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const vendorPartnerships = useMemo(() => {
    const filteredVendorPartnerships = filter(
      data?.company_vendor_partnerships || [],
      (vendorPartnership) =>
        vendorPartnership.vendor.name
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(
      filteredVendorPartnerships,
      (vendorPartnership) => vendorPartnership.vendor.name
    );
  }, [searchQuery, data?.company_vendor_partnerships]);

  return (
    <Page appBarTitle={"Vendors"}>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        justifyContent="space-between"
      >
        <Box display="flex">
          <TextField
            label="Search"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
          />
        </Box>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <VendorPartnershipsDataGrid
          isBankUserRole
          isExcelExport
          vendorPartnerships={vendorPartnerships}
        />
      </Box>
    </Page>
  );
}

export default BankVendorsPage;
