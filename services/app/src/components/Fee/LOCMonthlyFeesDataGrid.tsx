import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(minimumMonthlyFees: any[]): RowsProp {
  return minimumMonthlyFees.map((rowInfo) => {
    return {
      ...rowInfo,
      id: rowInfo.company.identifier,
      company_name: rowInfo.company.name,
      total_outstanding_interest: rowInfo.total_outstanding_interest,
      fee_amount: rowInfo.fee_amount,
      fee_period: rowInfo.fee_info?.duration,
      fee_due: rowInfo.fee_info?.amount_short,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  minimumLOCFees: any;
}

export default function LOCMonthlyFeesDataGrid({
  isExcelExport = true,
  minimumLOCFees,
}: Props) {
  const rows = getRows(minimumLOCFees);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "company_name",
        caption: "Company Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "fee_amount",
        caption: "Amount to Reverse Draft ACH",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_amount} />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Total Outstanding Interest",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "fee_due",
        caption: "Minimum Interest Fee Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_due} />
        ),
      },
      {
        dataField: "fee_period",
        caption: "Minimum Interest Period",
        minWidth: ColumnWidths.MinWidth,
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
