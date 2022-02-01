import { Box, TextField } from "@material-ui/core";
import MetrcPackagesDataGrid from "components/Packages/MetrcPackagesDataGrid";
import {
  Companies,
  useGetActiveMetrcPackagesByCompanyIdQuery,
} from "generated/graphql";
import { filter } from "lodash";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerMetrcPackagesTab({ companyId }: Props) {
  const { data, error } = useGetActiveMetrcPackagesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const metrcPackages = useMemo(
    () =>
      filter(
        data?.metrc_packages || [],
        (metrcPackage) =>
          `${metrcPackage.package_id}`
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.metrc_packages]
  );

  return (
    <Box mt={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by package ID"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 400 }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <MetrcPackagesDataGrid metrcPackages={metrcPackages} />
      </Box>
    </Box>
  );
}
