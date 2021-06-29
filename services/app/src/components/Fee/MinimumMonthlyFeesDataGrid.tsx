import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(minimumMonthlyFees: any[]): RowsProp {
  return minimumMonthlyFees.map((minimumMonthlyFee) => {
    return {
      ...minimumMonthlyFees,
      id: minimumMonthlyFee.company.identifier,
      company_name: minimumMonthlyFee.company.name,
      fee_period: minimumMonthlyFee.fee_info?.duration,
      fee_due: minimumMonthlyFee.fee_info?.amount_short,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  minimumMonthlyFees: any;
}

export default function MinimumMonthlyFeesDataGrid({
  isExcelExport = true,
  minimumMonthlyFees,
}: Props) {
  const rows = getRows(minimumMonthlyFees);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "company_name",
        caption: "Company Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "fee_period",
        caption: "Minimum Interest Period",
        minWidth: ColumnWidths.MinWidth,
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
