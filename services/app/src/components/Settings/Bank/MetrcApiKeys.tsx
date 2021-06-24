import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import UpsertMetrcKeyModal from "components/Settings/Bank/UpsertMetrcKeyModal";
import APIStatusChip from "components/Shared/Chip/APIStatusChip";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CompanySettings, MetrcApiKeyFragment } from "generated/graphql";
import { formatDatetimeString } from "lib/date";

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
    <Box mt={2}>
      <Box>
        <Typography variant="body1">{`Is Functioning?: ${
          metrcKey.is_functioning ? "Yes" : "No"
        }`}</Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body1">
          {`Last used at: ${
            metrcKey.last_used_at
              ? formatDatetimeString(metrcKey.last_used_at)
              : "None"
          }`}
        </Typography>
      </Box>
      {metrcKey.status_codes_payload &&
        Object.keys(metrcKey.status_codes_payload).map((licenseNum) => {
          const statusesObj = metrcKey.status_codes_payload[licenseNum];
          return (
            <Box key={licenseNum} display="flex" flexDirection="column" mt={2}>
              <Box>
                <Typography variant="body1">
                  {`License number: ${licenseNum}`}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" width={400} pl={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={1}
                  mr={1}
                >
                  <Typography color="textSecondary" variant="body1">
                    Transfers API:
                  </Typography>
                  <Box>
                    <APIStatusChip
                      statusCode={statusesObj.transfers_api}
                    ></APIStatusChip>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={1}
                  mr={1}
                >
                  <Typography color="textSecondary" variant="body1">
                    Packages API:
                  </Typography>
                  <Box>
                    <APIStatusChip
                      statusCode={statusesObj.packages_api}
                    ></APIStatusChip>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={1}
                  mr={1}
                >
                  <Typography color="textSecondary" variant="body1">
                    Packages Wholesale API:
                  </Typography>
                  <Box>
                    <APIStatusChip
                      statusCode={statusesObj.packages_api}
                    ></APIStatusChip>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={1}
                  mr={1}
                >
                  <Typography color="textSecondary" variant="body1">
                    Lab Results API:
                  </Typography>
                  <Box>
                    <APIStatusChip
                      statusCode={statusesObj.lab_results_api}
                    ></APIStatusChip>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
    </Box>
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
      {hasKey ? (
        <Box mt={1}>
          <Alert severity="info">Metrc API key is set up</Alert>
        </Box>
      ) : (
        <Box mt={1}>
          <Alert severity="warning">Metrc API key is NOT set up yet</Alert>
        </Box>
      )}
      <Box mt={2}>
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
