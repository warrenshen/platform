import { Box, CircularProgress, Typography } from "@material-ui/core";
import MetrcDownloadSummariesGrid from "components/Metrc/MetrcDownloadSummariesGrid";
import APIStatusChip from "components/Shared/Chip/APIStatusChip";
import {
  GetMetrcApiKeysByCompanyIdQuery,
  useGetMetrcDownloadSummariesByMetrcApiKeyIdQuery,
} from "generated/graphql";
import { formatDateString, formatDatetimeString } from "lib/date";
import { useMemo } from "react";

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
  metrcApiKey: GetMetrcApiKeysByCompanyIdQuery["metrc_api_keys"][0];
}

export default function MetrcApiKeyInfo({ number, metrcApiKey }: Props) {
  // TAG: warrenshen.
  const { data, loading } = useGetMetrcDownloadSummariesByMetrcApiKeyIdQuery({
    variables: {
      metrcApiKeyId: metrcApiKey.id,
    },
  });

  const metrcDownloadSummaries = useMemo(
    () => data?.metrc_download_summaries || [],
    [data]
  );

  return (
    <Box mt={2}>
      <Box>
        <Typography variant="subtitle1">
          <strong>{`Key #${number}`}</strong>
        </Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body1">
          <strong>{`Is Functioning?: ${
            metrcApiKey.is_functioning ? "YES" : "NO"
          }`}</strong>
        </Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body1">
          {`Last functioning at: ${
            metrcApiKey.last_used_at
              ? formatDatetimeString(metrcApiKey.last_used_at)
              : "None"
          }`}
        </Typography>
      </Box>
      {metrcApiKey.status_codes_payload &&
        Object.keys(metrcApiKey.status_codes_payload).map((licenseNumber) => {
          const statusesObj = metrcApiKey.status_codes_payload[licenseNumber];
          return (
            <Box
              key={licenseNumber}
              display="flex"
              flexDirection="column"
              mt={2}
            >
              <Box>
                <Typography variant="body1">
                  {`License number: ${licenseNumber}`}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="body1">{`Download summaries: ${
                  metrcDownloadSummaries.length > 0
                    ? `Date range: ${formatDateString(
                        metrcDownloadSummaries[0].date
                      )} - ${formatDateString(
                        metrcDownloadSummaries[
                          metrcDownloadSummaries.length - 1
                        ].date
                      )}`
                    : ""
                }`}</Typography>
                {loading ? (
                  <Box my={1}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box mt={2}>
                    <MetrcDownloadSummariesGrid
                      metrcDownloadSummaries={metrcDownloadSummaries.filter(
                        (metrcDownloadSummary) =>
                          metrcDownloadSummary.license_number === licenseNumber
                      )}
                    />
                  </Box>
                )}
              </Box>
              <Box display="flex" flexDirection="column" width={500} mt={2}>
                <Box mb={2}>
                  <Typography variant="body1">{`API Statuses:`}</Typography>
                </Box>
                <Box display="flex" flexDirection="column" pl={2}>
                  <Box mb={2}>
                    <Box mb={1}>
                      <Typography variant="subtitle2">
                        <strong>Transfers</strong>
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
                        <strong>Packages (Inventory)</strong>
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
                        <strong>Cultivation</strong>
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
                        <strong>Sales</strong>
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
            </Box>
          );
        })}
    </Box>
  );
}
