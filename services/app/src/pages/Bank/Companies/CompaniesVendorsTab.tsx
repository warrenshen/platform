import { Box, InputAdornment, TextField } from "@material-ui/core";
import CompaniesVendorsDataGrid from "components/Vendors/CompaniesVendorsDataGrid";
import { useGetVendorsWithMetadataQuery } from "generated/graphql";
import { SearchIcon } from "icons";
import { todayAsDateStringServer } from "lib/date";
import { filter } from "lodash";
import { useMemo, useState } from "react";

export default function CompaniesVendorsTab() {
  const { data } = useGetVendorsWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  const [searchQuery, setSearchQuery] = useState("");

  const vendors = useMemo(
    () =>
      filter(
        data?.vendors || [],
        (vendor) =>
          vendor.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.vendors]
  );

  return (
    <Box>
      <Box display="flex" mt={4} mb={4}>
        <TextField
          autoFocus
          label="Search"
          value={searchQuery}
          onChange={({ target: { value } }) => setSearchQuery(value)}
          style={{ width: 430 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box>
        <CompaniesVendorsDataGrid vendors={vendors} />
      </Box>
    </Box>
  );
}
