import { Box, InputAdornment, TextField } from "@material-ui/core";
import ParentCompaniesDataGrid from "components/Customer/ParentCompaniesDataGrid";
import { useGetParentCompaniesQuery } from "generated/graphql";
import { SearchIcon } from "icons";
import { filter } from "lodash";
import { useMemo, useState } from "react";

export default function CompaniesParentCompaniesTab() {
  const { data } = useGetParentCompaniesQuery({
    fetchPolicy: "network-only",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const companies = useMemo(
    () =>
      filter(
        data?.parent_companies || [],
        (company) =>
          company.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.parent_companies]
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
        <ParentCompaniesDataGrid parentCompanies={companies} />
      </Box>
    </Box>
  );
}
