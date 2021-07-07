import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(minimumMonthlyFees: any[]): RowsProp {
  return minimumMonthlyFees.map((rowInfo) => {
    return {
      ...rowInfo,
      id: rowInfo.company.id,
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
  monthEndPayments: any;
  actionItems: DataGridActionItem[];
}

export default function MonthEndPaymentsDataGrid({
  isExcelExport = true,
  monthEndPayments,
  actionItems,
}: Props) {
  const rows = getRows(monthEndPayments);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 80,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        fixed: true,
        dataField: "company_name",
        caption: "Company Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "fee_amount",
        caption: "Payment Total Amount",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_amount} />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Amount To Accrued Interest",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "fee_due",
        caption: "Amount To Minimum Interest Fee",
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
    [actionItems]
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
