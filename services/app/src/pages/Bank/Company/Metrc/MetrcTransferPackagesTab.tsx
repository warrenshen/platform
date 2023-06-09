import { Box, TextField } from "@material-ui/core";
import MetrcTransferPackagesDataGrid from "components/Transfers/v2/MetrcTransferPackagesDataGrid";
import {
  Companies,
  useGetMetrcTransferPackagesByCompanyIdQuery,
} from "generated/graphql";
import { filter } from "lodash";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function CompanyMetrcTransferPackagesTab({ companyId }: Props) {
  const { data, error } = useGetMetrcTransferPackagesByCompanyIdQuery({
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

  const metrcTransferPackages = useMemo(
    () =>
      filter(
        data?.metrc_transfer_packages || [],
        (metrcPackage) =>
          `${metrcPackage.package_id} ${metrcPackage.metrc_transfer?.manifest_number}`
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.metrc_transfer_packages]
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
        <MetrcTransferPackagesDataGrid
          metrcTransferPackages={metrcTransferPackages}
        />
      </Box>
    </Box>
  );
}
