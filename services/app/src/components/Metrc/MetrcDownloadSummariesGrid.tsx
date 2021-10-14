import { Box, Tooltip, Typography } from "@material-ui/core";
import {
  GetMetrcApiKeysPerCompanyQuery,
  MetrcDownloadSummaryFragment,
} from "generated/graphql";
import { formatDateString, previousDayAsDateStringServer } from "lib/date";
import { MetrcDownloadSummaryStatusEnum } from "lib/enum";
import { useMemo } from "react";
import styled from "styled-components";

const StyledBox = styled.div<{ backgroundColor: string }>`
  width: 36px;
  height: 36px;
  background-color: ${(props) => props.backgroundColor};
  border: 1px solid white;
  box-sizing: border-box;
`;

const StatusToColor = {
  [MetrcDownloadSummaryStatusEnum.BespokeServerError]: "#000000", // Red
  [MetrcDownloadSummaryStatusEnum.MetrcServerError]: "#e74c3c", // Orange
  [MetrcDownloadSummaryStatusEnum.NoAccess]: "#f1c40f", // Green
  [MetrcDownloadSummaryStatusEnum.Success]: "#2ecc71",
};

function MetrcDownloadSummaryCell({
  date,
  label,
  status,
}: {
  date: string;
  label: string;
  status: MetrcDownloadSummaryStatusEnum;
}) {
  return (
    <Tooltip
      arrow
      interactive
      title={`[${formatDateString(date)}] ${label}: ${status}`}
    >
      <StyledBox backgroundColor={status ? StatusToColor[status] : "none"} />
    </Tooltip>
  );
}

function MetrcDownloadSummaryColumn({
  metrcDownloadSummary,
}: {
  metrcDownloadSummary: MetrcDownloadSummaryFragment;
}) {
  return (
    <Box display="flex" flexDirection="column" width={36}>
      <MetrcDownloadSummaryCell
        date={metrcDownloadSummary.date}
        label={"Packages"}
        status={
          metrcDownloadSummary.packages_status as MetrcDownloadSummaryStatusEnum
        }
      />
      <MetrcDownloadSummaryCell
        date={metrcDownloadSummary.date}
        label={"Transfers"}
        status={
          metrcDownloadSummary.transfers_status as MetrcDownloadSummaryStatusEnum
        }
      />
      <MetrcDownloadSummaryCell
        date={metrcDownloadSummary.date}
        label={"Sales"}
        status={
          metrcDownloadSummary.sales_status as MetrcDownloadSummaryStatusEnum
        }
      />
      <MetrcDownloadSummaryCell
        date={metrcDownloadSummary.date}
        label={"Plants"}
        status={
          metrcDownloadSummary.plants_status as MetrcDownloadSummaryStatusEnum
        }
      />
      <MetrcDownloadSummaryCell
        date={metrcDownloadSummary.date}
        label={"Plant Batches"}
        status={
          metrcDownloadSummary.plant_batches_status as MetrcDownloadSummaryStatusEnum
        }
      />
      <MetrcDownloadSummaryCell
        date={metrcDownloadSummary.date}
        label={"Harvests"}
        status={
          metrcDownloadSummary.harvests_status as MetrcDownloadSummaryStatusEnum
        }
      />
    </Box>
  );
}

interface Props {
  metrcApiKey: GetMetrcApiKeysPerCompanyQuery["metrc_api_keys"][0];
}

export default function MetrcDownloadSummariesGrid({ metrcApiKey }: Props) {
  const rawMetrcDownloadSummaries = metrcApiKey.metrc_download_summaries;
  // Fill in missing dates, if applicable.
  // For example, we may only have download summaries for October 2021 and November 2020
  // and none for any of the months in between (those months have not been backfilled yet).
  const metrcDownloadSummaries = useMemo(() => {
    const result: MetrcDownloadSummaryFragment[] = [];

    if (rawMetrcDownloadSummaries.length <= 0) {
      return result;
    }

    const firstMetrcDownloadSummary = rawMetrcDownloadSummaries[0];
    const endDate = firstMetrcDownloadSummary.date;
    const startDate =
      rawMetrcDownloadSummaries[rawMetrcDownloadSummaries.length - 1].date;

    let currentDate = endDate;
    let rawIndex = 0;

    while (currentDate >= startDate) {
      if (rawMetrcDownloadSummaries[rawIndex].date === currentDate) {
        result.push(rawMetrcDownloadSummaries[rawIndex]);
        rawIndex += 1;
      } else {
        result.push({
          id: currentDate,
          company_id: firstMetrcDownloadSummary.company_id,
          metrc_api_key_id: firstMetrcDownloadSummary.metrc_api_key_id,
          license_number: firstMetrcDownloadSummary.license_number,
          date: currentDate,
          status: "",
          harvests_status: "",
          packages_status: "",
          plant_batches_status: "",
          plants_status: "",
          sales_status: "",
          transfers_status: "",
          updated_at: undefined,
        } as MetrcDownloadSummaryFragment);
      }
      currentDate = previousDayAsDateStringServer(currentDate);
    }

    return result;
  }, [rawMetrcDownloadSummaries]);

  return (
    <Box display="flex" flexDirection="column">
      <Box>
        <Typography>
          {metrcDownloadSummaries.length > 0
            ? `Date range: ${formatDateString(
                metrcDownloadSummaries[0].date
              )} (left) -> ${formatDateString(
                metrcDownloadSummaries[metrcDownloadSummaries.length - 1].date
              )} (right)`
            : ""}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2} overflow="scroll">
        <Box display="flex">
          {metrcDownloadSummaries.map((metrcDownloadSummary) => (
            <MetrcDownloadSummaryColumn
              key={metrcDownloadSummary.id}
              metrcDownloadSummary={metrcDownloadSummary}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
