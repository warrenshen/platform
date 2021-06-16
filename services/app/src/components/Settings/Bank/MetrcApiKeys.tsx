import { Box, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import UpsertMetrcKeyModal from "components/Settings/Bank/UpsertMetrcKeyModal";
import APIStatusChip from "components/Shared/Chip/APIStatusChip";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CompanySettings, MetrcApiKeyFragment } from "generated/graphql";

interface Props {
  companySettingsId: CompanySettings["id"];
  metrcApiKey: MetrcApiKeyFragment;
  handleDataChange: () => void;
}

interface StatusProps {
  metrcKey: MetrcApiKeyFragment;
}

function StatusOfKey({ metrcKey }: StatusProps) {
  return (
    <>
      <h4>API Key Status</h4>
      <Grid>
        <Box>{`Is Functioning?: ${
          metrcKey.is_functioning ? "Yes" : "No"
        }`}</Box>
        <Box>{`Last used: ${metrcKey.last_used_at}`}</Box>
        {metrcKey.status_codes_payload &&
          Object.keys(metrcKey.status_codes_payload).map((licenseNum) => {
            const statusesObj = metrcKey.status_codes_payload[licenseNum];
            return (
              <Box key={licenseNum} mt={2}>
                <Box>License number: {licenseNum}</Box>
                <Box>
                  Transfers API:{" "}
                  <APIStatusChip
                    statusCode={statusesObj.transfers_api}
                  ></APIStatusChip>
                </Box>
                <Box>
                  Packages API:{" "}
                  <APIStatusChip
                    statusCode={statusesObj.packages_api}
                  ></APIStatusChip>
                </Box>
                <Box>
                  Lab Results API:{" "}
                  <APIStatusChip
                    statusCode={statusesObj.lab_results_api}
                  ></APIStatusChip>
                </Box>
              </Box>
            );
          })}
      </Grid>
    </>
  );
}

export default function MetrcApiKeys({
  companySettingsId,
  metrcApiKey,
  handleDataChange,
}: Props) {
  const hasKey = !!metrcApiKey;

  return (
    <Box>
      {!hasKey && (
        <Box mb={1}>
          <Alert severity="warning">No Metrc API key setup yet</Alert>
        </Box>
      )}
      <Box>
        <ModalButton
          label={hasKey ? "Edit API Key" : "Add API Key"}
          modal={({ handleClose }) => (
            <UpsertMetrcKeyModal
              metrcApiKey={metrcApiKey}
              companySettingsId={companySettingsId}
              handleClose={() => {
                handleDataChange();
                handleClose();
              }}
            />
          )}
        />
      </Box>
      {hasKey && <StatusOfKey metrcKey={metrcApiKey}></StatusOfKey>}
    </Box>
  );
}
