import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import {
  DebtFacilityCapacityLimitedFragment,
  GetDebtFacilityCapacitySubscription,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  capacities: DebtFacilityCapacityLimitedFragment[];
  isExcelExport?: boolean;
  isSortingDisabled?: boolean;
  pager?: boolean;
  pageSize?: number;
}

// debt_facility_name: capacity.debt_facility?.name,

function getRows(
  capacities: GetDebtFacilityCapacitySubscription["debt_facility_capacities"]
): RowsProp {
  return capacities.map((capacity) => ({
    ...capacity,
    debt_facility_name: capacity.debt_facility?.name,
  }));
}

export default function DebtFacilityCapacityDataGrid({
  capacities,
  isExcelExport = true,
  isSortingDisabled = false,
  pager = true,
  pageSize = 10,
}: Props) {
  const rows = useMemo(() => getRows(capacities), [capacities]);
  const allowedPageSizes = useMemo(() => [], []);

  const columns = useMemo(
    () => [
      {
        caption: "Change Date",
        dataField: "change_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            datetimeString={params.row.data.changed_at}
            isTimeVisible={false}
          />
        ),
      },
      {
        caption: "Debt Facility",
        dataField: "debt_facility_name",
        width: ColumnWidths.MinWidth,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.debt_facility_name} />
        ),
      },
      {
        caption: "Changed By",
        dataField: "changed_by",
        width: ColumnWidths.MinWidth,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.changed_by} />
        ),
      },
      {
        caption: "Capacity Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "left",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
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
