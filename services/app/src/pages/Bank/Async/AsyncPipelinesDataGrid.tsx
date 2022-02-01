import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  pager?: boolean;
  pageSize?: number;
  asyncPipelines: any[];
}

function getRows(asyncPipelines: any[]): RowsProp {
  return asyncPipelines.map((asyncPipeline) => ({
    ...asyncPipeline,
  }));
}

export default function AsyncPipelinesDataGrid({
  pager = true,
  pageSize = 10,
  asyncPipelines,
}: Props) {
  const rows = useMemo(() => getRows(asyncPipelines), [asyncPipelines]);

  const columns = useMemo(
    () => [
      {
        visible: true,
        caption: "Platform ID",
        dataField: "id",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "created_at",
        caption: "Created At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
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
        cellRender: (params: ValueFormatterParams) => (
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
    []
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
