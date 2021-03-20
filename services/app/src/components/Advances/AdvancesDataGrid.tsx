import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { PaymentFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

function getRows(payments: PaymentFragment[]): RowsProp {
  return payments.map((item) => {
    return {
      ...item,
    };
  });
}

interface Props {
  payments: PaymentFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
  isExcelExport?: boolean;
}

function AdvancesDataGrid({
  payments,
  customerSearchQuery,
  onClickCustomerName,
  isExcelExport = false,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(payments);
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Advance ID",
        width: 140,
      },
      {
        caption: "Customer Name",
        dataField: "company.name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            label={params.row.data.company.name}
            onClick={() => {
              onClickCustomerName(params.row.data.company.name);
              dataGrid?.instance.filter([
                "company.name",
                "=",
                params.row.data.company.name,
              ]);
            }}
          />
        ),
      },
      {
        caption: "Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        dataField: "method",
        caption: "Method",
        width: 90,
      },
      {
        caption: "Payment Date",
        dataField: "payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.payment_date} />
        ),
      },
      {
        caption: "Settlement Date",
        dataField: "settlement_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.settlement_date} />
        ),
      },
      {
        dataField: "submitted_by_user.full_name",
        caption: "Submitted By",
        width: 90,
      },
    ],
    [dataGrid?.instance, onClickCustomerName]
  );

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
      isExcelExport={isExcelExport}
      pager
    />
  );
}

export default AdvancesDataGrid;
