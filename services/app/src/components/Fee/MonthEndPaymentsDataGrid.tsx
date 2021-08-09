import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(monthEndPayments: any[]): RowsProp {
  return monthEndPayments.map((monthEndPayment) => {
    return {
      ...monthEndPayment,
      id: monthEndPayment.company.id,
      company_name: monthEndPayment.company.name,
      total_outstanding_interest: monthEndPayment.total_outstanding_interest,
      fee_amount: monthEndPayment.fee_amount,
      fee_period: monthEndPayment.fee_info?.duration,
      fee_due: monthEndPayment.fee_info?.amount_short,
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
        caption: "Total Amount",
        minWidth: ColumnWidths.Currency,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_amount} />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Amount To Accrued Interest",
        minWidth: ColumnWidths.Currency,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "fee_due",
        caption: "Amount To Minimum Interest Fee Due Now",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_due} />
        ),
      },
      {
        dataField: "fee_period",
        caption: "Minimum Interest Period (If Applicable)",
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
