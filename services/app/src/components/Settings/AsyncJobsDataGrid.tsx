import { GridValueFormatterParams } from "@material-ui/data-grid";
import AsyncJobDetailModal from "components/Settings/AsyncJobDetailModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { AsyncJobFragment, AsyncJobs } from "generated/graphql";
import {
  getTimeFromDateToNow,
  getTimeInbetweenDates,
  parseDateStringServer,
} from "lib/date";
import {
  AsyncJobNameEnum,
  AsyncJobNameEnumToLabel,
  AsyncJobNames,
  AsyncJobStatusEnum,
  AsyncJobStatusToLabel,
  AsyncJobStatuses,
} from "lib/enum";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  isCompletedJob?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  pager?: boolean;
  asyncJobs: AsyncJobFragment[];
  selectedAsyncJobIds?: AsyncJobs["id"][];
  handleSelectAsyncJobs?: (asyncJobs: AsyncJobs[]) => void;
  actionItems?: DataGridActionItem[];
  isFilteringEnabled?: boolean;
  isRetryPayloadVisible?: boolean;
}

export default function AsyncJobsDataGrid({
  isCompletedJob = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  pager = true,
  asyncJobs,
  selectedAsyncJobIds,
  handleSelectAsyncJobs,
  actionItems,
  isFilteringEnabled = true,
  isRetryPayloadVisible = false,
}: Props) {
  function getRows(asyncJobs: AsyncJobFragment[]) {
    return asyncJobs.map((asyncJob) => {
      return formatRowModel({
        ...asyncJob,
        end_time: !!asyncJob?.ended_at
          ? parseDateStringServer(asyncJob.ended_at)
          : null,
        high_priority: !!asyncJob?.is_high_priority && true,
        id: !!asyncJob?.id ? asyncJob.id : null,
        name: !!asyncJob?.name ? (asyncJob.name as AsyncJobNameEnum) : null,
        queued_time: !!asyncJob?.queued_at
          ? parseDateStringServer(asyncJob.queued_at)
          : null,
        running_time: !!asyncJob?.started_at
          ? asyncJob.started_at >= asyncJob.ended_at || !asyncJob?.ended_at
            ? getTimeFromDateToNow(asyncJob.started_at, true)
            : null
          : null,
        run_time: !!asyncJob?.ended_at
          ? getTimeInbetweenDates(asyncJob.ended_at, asyncJob.started_at)
          : null,
        init_time: !!asyncJob?.initialized_at
          ? parseDateStringServer(asyncJob.initialized_at)
          : null,
        start_time: !!asyncJob?.started_at
          ? parseDateStringServer(asyncJob.started_at)
          : null,
        status: !!asyncJob?.status
          ? (asyncJob.status as AsyncJobStatusEnum)
          : null,
        submitting_user: !!asyncJob?.submitted_by_user?.full_name
          ? asyncJob.submitted_by_user.full_name
          : null,
      });
    });
  }
  const [modalAsyncJobId, setModalAsyncJobId] = useState<
    AsyncJobFragment["id"] | null
  >(null);
  const rows = getRows(asyncJobs);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "",
        dataField: "id",
        width: ColumnWidths.Open,
        cellRender: (params: GridValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => setModalAsyncJobId(params.row.data.id)}
            label={"OPEN"}
          />
        ),
      },
      {
        caption: "Name",
        dataField: "name",
        width: ColumnWidths.AsyncJobName,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: AsyncJobNames.map((jobName) => ({
                status: jobName,
                label: AsyncJobNameEnumToLabel[jobName],
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "label",
        },
      },
      {
        caption: "Queued Time",
        dataField: "queued_time",
        format: "longDateLongTime",
        minWidth: ColumnWidths.Datetime,
      },
      {
        caption: "Submitting User",
        dataField: "submitting_user",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Status",
        dataField: "status",
        minWidth: ColumnWidths.MinWidth,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: AsyncJobStatuses.map((jobStatus) => ({
                status: jobStatus,
                label: AsyncJobStatusToLabel[jobStatus],
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "label",
        },
      },
      {
        caption: "High Priority",
        dataField: "high_priority",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Init Time",
        dataField: "init_time",
        format: "longDateLongTime",
        minWidth: ColumnWidths.Datetime,
      },
      {
        caption: "Start Time",
        dataField: "start_time",
        format: "longDateLongTime",
        minWidth: ColumnWidths.Datetime,
      },
      {
        caption: "End Time",
        dataField: "end_time",
        format: "longDateLongTime",
        minWidth: ColumnWidths.Datetime,
      },
      {
        visible: !isCompletedJob,
        caption: "Running Time",
        dataField: "running_time",
        minWidth: ColumnWidths.Datetime,
      },
      {
        visible: isCompletedJob,
        caption: "Run Time",
        dataField: "run_time",
        minWidth: ColumnWidths.Datetime,
      },
      {
        visible: isRetryPayloadVisible,
        caption: "Retry Payload",
        dataField: "retry_payload",
        minWidth: ColumnWidths.Comment,
      },
    ],
    [isCompletedJob, isRetryPayloadVisible]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectAsyncJobs &&
        handleSelectAsyncJobs(selectedRowsData as AsyncJobs[]),
    [handleSelectAsyncJobs]
  );

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <>
      {!!modalAsyncJobId && (
        <AsyncJobDetailModal
          asyncJobId={modalAsyncJobId}
          handleClose={() => setModalAsyncJobId(null)}
        />
      )}
      <ControlledDataGrid
        pager={pager}
        select={isMultiSelectEnabled}
        dataSource={rows}
        columns={columns}
        filtering={filtering}
        selectedRowKeys={selectedAsyncJobIds}
        onSelectionChanged={handleSelectionChanged}
        isExcelExport={isExcelExport}
      />
    </>
  );
}
