import { TextField } from "@material-ui/core";
import { Box } from "@material-ui/core";
import MetrcPackagesDataGrid from "components/Transfers/MetrcPackagesDataGrid";
import {
  Companies,
  useGetMetrcPackagesByCompanyIdQuery,
} from "generated/graphql";
import { useMemo } from "react";
import { useState } from "react";
import { filter } from "lodash";

interface Props {
  companyId: Companies["id"];
}

export default function CustomermetrcPackagesTab({ companyId }: Props) {
  const { data, error } = useGetMetrcPackagesByCompanyIdQuery({
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
          `${metrcPackage.package_id} ${metrcPackage.metrc_transfer.manifest_number}`
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
            label="Search by package ID or manifest number"
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
