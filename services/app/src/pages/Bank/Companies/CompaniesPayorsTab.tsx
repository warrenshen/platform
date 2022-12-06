import { Box, InputAdornment, TextField } from "@material-ui/core";
import CompaniesVendorsDataGrid from "components/Vendors/CompaniesVendorsDataGrid";
import { useGetPayorsWithMetadataQuery } from "generated/graphql";
import { SearchIcon } from "icons";
import { todayAsDateStringServer } from "lib/date";
import { filter } from "lodash";
import { useMemo, useState } from "react";

export default function CompaniesVendorsTab() {
  const { data } = useGetPayorsWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  const [searchQuery, setSearchQuery] = useState("");

  const payors = useMemo(
    () =>
      filter(
        data?.payors || [],
        (payor) =>
          payor.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.payors]
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
        <CompaniesVendorsDataGrid vendors={payors} />
      </Box>
    </Box>
  );
}
