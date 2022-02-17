import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import { DebtFacilityLimitedFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  facilities: DebtFacilityLimitedFragment[];
  isExcelExport?: boolean;
  isSortingDisabled?: boolean;
  pager?: boolean;
  pageSize?: number;
}

function getRows(facilities: DebtFacilityLimitedFragment[]): RowsProp {
  return facilities.map((facility) => ({
    ...facility,
  }));
}

export default function DebtFacilityCapacityDataGrid({
  facilities,
  isExcelExport = true,
  isSortingDisabled = false,
  pager = true,
  pageSize = 10,
}: Props) {
  const rows = useMemo(() => getRows(facilities), [facilities]);
  const allowedPageSizes = useMemo(() => [], []);

  const columns = useMemo(
    () => [
      {
        caption: "Facility Name",
        dataField: "name",
        width: ColumnWidths.MinWidth,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.name} />
        ),
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      pager={pager}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
    />
  );
}
