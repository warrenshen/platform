import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(financialSummaries: any[]): RowsProp {
  return financialSummaries.map((financialSummary) => {
    return {
      id: financialSummary.date,
      ...financialSummary,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  financialSummaries: any;
}

export default function LoanFinancialSummariesDataGrid({
  isExcelExport = true,
  financialSummaries,
}: Props) {
  const rows = getRows(financialSummaries);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "date",
        caption: "Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.date} />
        ),
      },
      {
        dataField: "outstanding_principal",
        caption: "Principal Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_principal} />
        ),
      },
      {
        dataField: "outstanding_principal_for_interest",
        caption: "Interest Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.outstanding_principal_for_interest}
          />
        ),
      },
      {
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
        ),
      },
      {
        dataField: "outstanding_fees",
        caption: "Outstanding Late Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
        ),
      },
      {
        dataField: "interest_due_for_day",
        caption: "Interest Due For Day",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.interest_due_for_day} />
        ),
      },
      {
        dataField: "fee_for_day",
        caption: "Fee For Day",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_for_day} />
        ),
      },
      {
        dataField: "interest_rate",
        caption: "Interest Rate",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "fee_multiplier",
        caption: "Fee Multiplier",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled
      dataSource={rows}
      columns={columns}
    />
  );
}
