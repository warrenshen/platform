import { Box, Typography } from "@material-ui/core";
import MetrcApiKeys from "components/Metrc/MetrcApiKeys";
import SyncMetrcData from "components/Metrc/SyncMetrcData";
import { Companies } from "generated/graphql";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerMetrcApiKeysTab({ companyId }: Props) {
  return (
    <Box mt={3}>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle1">
          <b>Sync Metrc Data</b>
        </Typography>
        <Box display="flex">
          <SyncMetrcData companyId={companyId} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle1">
          <b>Metrc API Keys</b>
        </Typography>
        <MetrcApiKeys companyId={companyId} companySettingsId={""} />
      </Box>
    </Box>
  );
}
