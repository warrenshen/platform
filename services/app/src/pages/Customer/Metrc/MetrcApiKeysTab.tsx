import { Box, Typography } from "@material-ui/core";
import MetrcApiKeysList from "components/Metrc/MetrcApiKeysList";
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
          <strong>Sync Metrc Data</strong>
        </Typography>
        <Box display="flex">
          <SyncMetrcData companyId={companyId} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle1">
          <strong>Metrc API Keys</strong>
        </Typography>
        <MetrcApiKeysList companyId={companyId} />
      </Box>
    </Box>
  );
}
