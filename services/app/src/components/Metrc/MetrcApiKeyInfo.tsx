import { Box, Typography } from "@material-ui/core";
import APIStatusChip from "components/Shared/Chip/APIStatusChip";
import MetrcDownloadSummariesGrid from "components/Metrc/MetrcDownloadSummariesGrid";
import { GetMetrcApiKeysPerCompanyQuery } from "generated/graphql";
import { formatDatetimeString } from "lib/date";

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

interface Props {
  number: number;
  metrcApiKey: GetMetrcApiKeysPerCompanyQuery["metrc_api_keys"][0];
}

export default function MetrcApiKeyInfo({ number, metrcApiKey }: Props) {
  return (
    <Box mt={2}>
      <Box>
        <Typography variant="subtitle1">
          <b>{`Key #${number}`}</b>
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" overflow="scroll">
        <MetrcDownloadSummariesGrid metrcApiKey={metrcApiKey} />
      </Box>
      <Box mt={2}>
        <Typography variant="body2">{`Is Functioning?: ${
          metrcApiKey.is_functioning ? "Yes" : "No"
        }`}</Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body2">
          {`Last used at: ${
            metrcApiKey.last_used_at
              ? formatDatetimeString(metrcApiKey.last_used_at)
              : "None"
          }`}
        </Typography>
      </Box>
      {metrcApiKey.status_codes_payload &&
        Object.keys(metrcApiKey.status_codes_payload).map((licenseNum) => {
          const statusesObj = metrcApiKey.status_codes_payload[licenseNum];
          return (
            <Box key={licenseNum} display="flex" flexDirection="column" mt={2}>
              <Box mb={2}>
                <Typography variant="body2">
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
