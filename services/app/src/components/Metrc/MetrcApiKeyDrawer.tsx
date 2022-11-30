import { Box, Typography } from "@material-ui/core";
import LicenseMetrcDownloadSummariesGrid from "components/Metrc/LicenseMetrcDownloadSummariesGrid";
import MetrcApiKeyPermissionsDataGrid from "components/Metrc/MetrcApiKeyPermissionsDataGrid";
import Modal from "components/Shared/Modal/Modal";
import ModalDataPoint from "components/Shared/Modal/ModalDataPoint";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import { MetrcApiKeys, useGetMetrcApiKeyQuery } from "generated/graphql";
import { MetrcApiKeyPermissions, viewApiKey } from "lib/api/metrc";
import { useEffect, useState } from "react";

interface Props {
  metrcApiKeyId: MetrcApiKeys["id"];
  handleClose: () => void;
}

export default function MetrcApiKeyModal({
  metrcApiKeyId,
  handleClose,
}: Props) {
  const [apiKeyValue, setApiKeyValue] = useState("");

  const { data } = useGetMetrcApiKeyQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcApiKeyId,
    },
  });

  const metrcApiKey = data?.metrc_api_keys_by_pk;

  useEffect(() => {
    async function viewKey() {
      if (!metrcApiKey) {
        return;
      }
      const resp = await viewApiKey({
        variables: {
          metrc_api_key_id: metrcApiKey.id,
        },
      });
      if (resp.status === "OK") {
        setApiKeyValue(resp.data?.api_key || "Invalid");
      }
    }

    if (metrcApiKey) {
      viewKey();
    }
  }, [metrcApiKey]);

  if (!metrcApiKey) {
    return null;
  }

  const metrcApiKeyPermissions = (metrcApiKey.permissions_payload ||
    []) as MetrcApiKeyPermissions;
  const licenseNumbers = metrcApiKeyPermissions.map(
    (licensePermissions) => licensePermissions["license_number"]
  );

  return (
    <Modal
      title={"Metrc API Key"}
      subtitle={metrcApiKey.id}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <ModalDataPoint subtitle={"Platform ID"} text={metrcApiKey.id} />
      <ModalDataPoint subtitle={"Key Value (from Metrc)"} text={apiKeyValue} />
      <ModalDataPoint
        subtitle={"Is Working?"}
        text={!!metrcApiKey.is_functioning ? "Yes" : "No"}
      />
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Permissions
        </Typography>
        <MetrcApiKeyPermissionsDataGrid
          metrcApiKeyPermissions={metrcApiKeyPermissions}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Status Codes Payload JSON
        </Typography>
        <RawJsonToggle rawJson={metrcApiKey.status_codes_payload} />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Facilities Payload JSON
        </Typography>
        <RawJsonToggle rawJson={metrcApiKey.facilities_payload} />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Permissions Payload JSON
        </Typography>
        <RawJsonToggle rawJson={metrcApiKey.permissions_payload} />
      </Box>
      <Box display="flex" flexDirection="column">
        {licenseNumbers.map((licenseNumber) => (
          <Box key={licenseNumber} mt={2}>
            <LicenseMetrcDownloadSummariesGrid licenseNumber={licenseNumber} />
          </Box>
        ))}
      </Box>
    </Modal>
  );
}
