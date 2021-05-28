import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import { TransactionFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  transactions: TransactionFragment[];
  isMiniTable?: Boolean;
  isExcelExport?: boolean;
}

function TransactionsDataGrid({
  transactions,
  isMiniTable = false,
  isExcelExport = false,
}: Props) {
  const rows = transactions;

  const columns = useMemo(
    () => [
      {
        caption: "Created At",
        dataField: "created_at",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.created_at}
          />
        ),
      },
      {
        caption: "Effective Date",
        dataField: "effective_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.effective_date} />
        ),
      },
      {
        dataField: "id",
        caption: "Transaction ID",
        visible: !isMiniTable,
        width: 140,
      },
      {
        dataField: "payment.id",
        caption: "Payment ID",
        visible: !isMiniTable,
        width: 140,
      },
      {
        caption: "Company Name",
        dataField: "payment.company.name",
        visible: !isMiniTable,
        width: 140,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            label={params.row.data.payment.company.name}
            onClick={() => {}}
          />
        ),
      },
      {
        dataField: "type",
        caption: "Type",
        width: 140,
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
        caption: "To Principal",
        dataField: "to_principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_principal} />
        ),
      },
      {
        caption: "To Interest",
        dataField: "to_interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_interest} />
        ),
      },
      {
        caption: "To Fees",
        dataField: "to_fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_fees} />
        ),
      },
    ],
    [isMiniTable]
  );

  return (
    <ControlledDataGrid
      pager
      dataSource={rows}
      columns={columns}
      isExcelExport={isExcelExport}
    />
  );
}

export default TransactionsDataGrid;
