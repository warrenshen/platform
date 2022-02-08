import { Box, Typography } from "@material-ui/core";
import SyncMetrcData from "components/Metrc/SyncMetrcData";

export default function BankMetrcApiKeysTab() {
  return (
    <Box mt={3}>
      <Box display="flex" flexDirection="column">
        <Typography variant="subtitle1">
          <strong>Download Metrc Data - All Companies</strong>
        </Typography>
        <Box display="flex">
          <SyncMetrcData companyId={null} />
        </Box>
      </Box>
    </Box>
  );
}
