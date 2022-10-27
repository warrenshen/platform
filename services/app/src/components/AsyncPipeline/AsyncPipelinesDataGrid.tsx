import { GridValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import {
  AsyncPipelineLimitedFragment,
  AsyncPipelines,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  pager?: boolean;
  pageSize?: number;
  asyncPipelines: AsyncPipelineLimitedFragment[];
  handleClickAsyncPipeline: (asyncPipelineId: AsyncPipelines["id"]) => void;
}

function getRows(asyncPipelines: any[]) {
  return asyncPipelines.map((asyncPipeline) => ({
    ...asyncPipeline,
  }));
}

export default function AsyncPipelinesDataGrid({
  pager = true,
  pageSize = 10,
  asyncPipelines,
  handleClickAsyncPipeline,
}: Props) {
  const rows = useMemo(() => getRows(asyncPipelines), [asyncPipelines]);
  const columns = useMemo(
    () => [
      {
        visible: true,
        dataField: "id",
        caption: "Platform ID",
        width: 140,
        cellRender: (params: GridValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => handleClickAsyncPipeline(params.row.data.id)}
            label={params.row.data.id}
          />
        ),
      },
      {
        dataField: "created_at",
        caption: "Created At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.created_at}
          />
        ),
      },
      {
        dataField: "updated_at",
        caption: "Updated At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.updated_at}
          />
        ),
      },
      {
        dataField: "name",
        caption: "Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "status",
        caption: "Status",
        minWidth: ColumnWidths.MinWidth,
      },
    ],
    [handleClickAsyncPipeline]
  );

  const allowedPageSizes = useMemo(() => [], []);

  return (
    <ControlledDataGrid
      isExcelExport={true}
      isSortingDisabled={false}
      pager={pager}
      select={false}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
    />
  );
}
