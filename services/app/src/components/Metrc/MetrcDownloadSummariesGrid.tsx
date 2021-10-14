import { Box, Tooltip } from "@material-ui/core";
import {
  GetMetrcApiKeysPerCompanyQuery,
  MetrcDownloadSummaryFragment,
} from "generated/graphql";
import { MetrcDownloadSummaryStatusEnum } from "lib/enum";
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
    <Tooltip arrow interactive title={`[${date}] ${label}: ${status}`}>
      <StyledBox backgroundColor={StatusToColor[status]} />
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

// TODO(warren): compute dates that are missing in the set of existing download summaries.
export default function MetrcDownloadSummariesGrid({ metrcApiKey }: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex">
        {metrcApiKey.metrc_download_summaries.map((metrcDownloadSummary) => (
          <MetrcDownloadSummaryColumn
            key={metrcDownloadSummary.id}
            metrcDownloadSummary={metrcDownloadSummary}
          />
        ))}
      </Box>
    </Box>
  );
}
