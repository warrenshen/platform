import { Box } from "@material-ui/core";
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
  isMiniTable?: Boolean;
  transactions: TransactionFragment[];
}

function TransactionsDataGrid({ isMiniTable = false, transactions }: Props) {
  const rows = transactions;

  const columns = useMemo(
    () => [
      {
        caption: "Created At",
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
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        caption: "To Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_principal} />
        ),
      },
      {
        caption: "To Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_interest} />
        ),
      },
      {
        caption: "To Fees",
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
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid pager dataSource={rows} columns={columns} />
    </Box>
  );
}

export default TransactionsDataGrid;
