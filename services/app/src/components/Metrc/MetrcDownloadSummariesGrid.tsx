import { Box, Button, Tooltip, Typography } from "@material-ui/core";
import MetrcDownloadSummaryModal from "components/Metrc/MetrcDownloadSummaryModal";
import {
  MetrcDownloadSummaries,
  MetrcDownloadSummaryLimitedFragment,
} from "generated/graphql";
import {
  DateFormatClientMonthDayOnly,
  DateFormatClientYearOnly,
  formatDateString,
  isDateStringSunday,
  previousDayAsDateStringServer,
} from "lib/date";
import { MetrcDownloadSummaryStatusEnum } from "lib/enum";
import { useEffect, useState } from "react";
import styled from "styled-components";

// Show 90 MetrcDownloadSummaries per page.
const PageSize = 90;

const Cells = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

const Cell = styled.div<{ backgroundColor: string }>`
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
      <Cell backgroundColor={status ? StatusToColor[status] : "none"} />
    </Tooltip>
  );
}

function MetrcDownloadSummaryColumn({
  metrcDownloadSummary,
}: {
  metrcDownloadSummary: MetrcDownloadSummaryLimitedFragment;
}) {
  const [selectedMetrcDownloadSummaryId, setSelectedMetrcDownloadSummaryId] =
    useState<MetrcDownloadSummaries["id"]>(null);

  return (
    <Box display="flex" flexDirection="column" width={36}>
      {selectedMetrcDownloadSummaryId && (
        <MetrcDownloadSummaryModal
          metrcDownloadSummaryId={selectedMetrcDownloadSummaryId}
          handleClose={() => setSelectedMetrcDownloadSummaryId(null)}
        />
      )}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        height={40}
      >
        {isDateStringSunday(metrcDownloadSummary.date) && (
          <>
            <Typography variant="caption">
              <strong>
                {formatDateString(
                  metrcDownloadSummary.date,
                  DateFormatClientYearOnly
                )}
              </strong>
            </Typography>
            <Typography variant="caption">
              {formatDateString(
                metrcDownloadSummary.date,
                DateFormatClientMonthDayOnly
              )}
            </Typography>
          </>
        )}
      </Box>
      <Cells
        onClick={() =>
          setSelectedMetrcDownloadSummaryId(metrcDownloadSummary.id)
        }
      >
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
      </Cells>
    </Box>
  );
}

interface Props {
  metrcDownloadSummaries: MetrcDownloadSummaryLimitedFragment[];
}

export default function MetrcDownloadSummariesGrid({
  metrcDownloadSummaries,
}: Props) {
  const [pageNumber, setPageNumber] = useState(1);
  const [allMetrcDownloadSummaries, setAllMetrcDownloadSummaries] = useState<
    MetrcDownloadSummaryLimitedFragment[]
  >([]);

  // Fill in missing dates, if applicable.
  // For example, we may only have download summaries for October 2021 and November 2020
  // and none for any of the months in between (those months have not been backfilled yet).
  useEffect(() => {
    const resultMetrcDownloadSummaries: MetrcDownloadSummaryLimitedFragment[] =
      [];

    if (metrcDownloadSummaries.length > 0) {
      const firstMetrcDownloadSummary = metrcDownloadSummaries[0];
      const endDate = firstMetrcDownloadSummary.date;
      const startDate =
        metrcDownloadSummaries[metrcDownloadSummaries.length - 1].date;

      let currentDate = endDate;
      let rawIndex = 0;

      while (currentDate >= startDate) {
        if (metrcDownloadSummaries[rawIndex].date === currentDate) {
          resultMetrcDownloadSummaries.push(metrcDownloadSummaries[rawIndex]);
          rawIndex += 1;
        } else {
          resultMetrcDownloadSummaries.push({
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
          } as MetrcDownloadSummaryLimitedFragment);
        }
        currentDate = previousDayAsDateStringServer(currentDate);
      }
    }

    setAllMetrcDownloadSummaries(resultMetrcDownloadSummaries);
  }, [metrcDownloadSummaries]);

  const visibleMetrcDownloadSummaries = allMetrcDownloadSummaries.slice(
    (pageNumber - 1) * PageSize,
    pageNumber * PageSize
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2">
          {visibleMetrcDownloadSummaries.length > 0
            ? `Selected date range: ${formatDateString(
                visibleMetrcDownloadSummaries[0].date
              )} (left) -> ${formatDateString(
                visibleMetrcDownloadSummaries[
                  visibleMetrcDownloadSummaries.length - 1
                ].date
              )} (right)`
            : ""}
        </Typography>
        <Box display="flex" alignItems="center">
          <Button
            disabled={pageNumber <= 1}
            color="default"
            size="small"
            variant="outlined"
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            {"<"}
          </Button>
          <Box mx={1}>
            <Typography variant="body2">{`Page ${pageNumber}`}</Typography>
          </Box>
          <Button
            disabled={pageNumber * PageSize > allMetrcDownloadSummaries.length}
            color="default"
            size="small"
            variant="outlined"
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            {">"}
          </Button>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={2} overflow="scroll">
        <Box display="flex">
          {visibleMetrcDownloadSummaries.map((metrcDownloadSummary) => (
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
