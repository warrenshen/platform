import { TextField } from "@material-ui/core";
import { Box } from "@material-ui/core";
import MetrcTransfersDataGrid from "components/Transfers/MetrcTransfersDataGrid";
import {
  Companies,
  useGetMetrcTransfersByCompanyIdQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { useMemo } from "react";
import { useState } from "react";
import { filter } from "lodash";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerMetrcTransfersTab({ companyId }: Props) {
  const { data, error } = useGetMetrcTransfersByCompanyIdQuery({
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

  const metrcTransfers = useMemo(
    () =>
      filter(
        data?.metrc_transfers || [],
        (metrcTransfer) =>
          `${metrcTransfer.manifest_number} ${getCompanyDisplayName(
            metrcTransfer.vendor
          )} ${
            metrcTransfer.transfer_payload.ShipperFacilityLicenseNumber || ""
          }`
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.metrc_transfers]
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
            label="Search by manifest number, vendor name, or vendor license"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 500 }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <MetrcTransfersDataGrid metrcTransfers={metrcTransfers} />
      </Box>
    </Box>
  );
}
