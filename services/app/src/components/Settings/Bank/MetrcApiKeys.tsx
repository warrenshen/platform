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

function MetrcApiStatusChip({
  label,
  statusCode,
}: {
  label: string;
  statusCode: number;
}) {
  return (
    <Box display="flex" justifyContent="space-between" mt={1} mr={1}>
      <Typography color="textSecondary" variant="body1">
        {`${label} API:`}
      </Typography>
      <Box>
        <APIStatusChip statusCode={statusCode} />
      </Box>
    </Box>
  );
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
              <Box mb={2}>
                <Typography variant="body1">
                  {`License number: ${licenseNum}`}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" width={500} pl={2}>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Transfers</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Transfers"}
                    statusCode={statusesObj.transfers_api}
                  />
                  <MetrcApiStatusChip
                    label={"Transfer Packages"}
                    statusCode={statusesObj.transfer_packages_api}
                  />
                  <MetrcApiStatusChip
                    label={"Transfer Packages Wholesale"}
                    statusCode={statusesObj.transfer_packages_wholesale_api}
                  />
                  <MetrcApiStatusChip
                    label={"Lab Results"}
                    statusCode={statusesObj.lab_results_api}
                  />
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Packages (Inventory)</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Packages"}
                    statusCode={statusesObj.packages_api}
                  />
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Cultivation</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Plants"}
                    statusCode={statusesObj.plants_api}
                  />
                  <MetrcApiStatusChip
                    label={"Plant Batches"}
                    statusCode={statusesObj.plant_batches_api}
                  />
                  <MetrcApiStatusChip
                    label={"Harvests"}
                    statusCode={statusesObj.harvests_api}
                  />
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Sales</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Sales Receipts"}
                    statusCode={statusesObj.sales_receipts_api}
                  />
                  <MetrcApiStatusChip
                    label={"Sales Transactions"}
                    statusCode={statusesObj.sales_transactions_api}
                  />
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
