import { Box, TextField } from "@material-ui/core";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import { useGetClosedEbbaApplicationsQuery } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { filter } from "lodash";
import { useMemo, useState } from "react";

export default function EbbaApplicationsClosedTab() {
  const { data, error } = useGetClosedEbbaApplicationsQuery({
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const ebbaApplications = useMemo(
    () =>
      filter(
        data?.ebba_applications || [],
        (ebbaApplication) =>
          getCompanyDisplayName(ebbaApplication.company)
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.ebba_applications]
  );

  return (
    <Box mt={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 300 }}
          />
        </Box>
        <Box display="flex" flexDirection="row-reverse" />
      </Box>
      <Box display="flex" flexDirection="column">
        <EbbaApplicationsDataGrid
          isApprovedAtVisible
          isBorrowingBaseFieldsVisible
          isCategoryVisible
          isCompanyVisible
          ebbaApplications={ebbaApplications}
        />
      </Box>
    </Box>
  );
}
