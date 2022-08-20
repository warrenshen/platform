import { RowsProp } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { TransactionExtendedFragment } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { PaymentTypeEnum, PaymentTypeToLabel } from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  transactions: TransactionExtendedFragment[];
  isMiniTable?: Boolean;
  isExcelExport?: boolean;
}

const getRows = (transactions: TransactionExtendedFragment[]): RowsProp => {
  return transactions.map((transaction) => {
    return formatRowModel({
      ...transaction,
      company_name: !!transaction?.payment?.company?.name
        ? transaction.payment.company.name
        : null,
      company_url: !!transaction?.payment?.company?.id
        ? getBankCompanyRoute(
            transaction.payment.company.id,
            BankCompanyRouteEnum.Overview
          )
        : null,
      created_at: !!transaction?.created_at
        ? parseDateStringServer(transaction.created_at)
        : null,
      cy_identifier: !!transaction?.payment?.company?.name
        ? `${transaction.payment.company.name.replace("-", "")}-button`
        : "",
      effective_date: !!transaction?.effective_date
        ? parseDateStringServer(transaction.effective_date)
        : null,
    });
  });
};

function TransactionsDataGrid({
  transactions,
  isMiniTable = false,
  isExcelExport = true,
}: Props) {
  const rows = useMemo(() => getRows(transactions), [transactions]);

  const columns = useMemo(
    () => [
      {
        caption: "Created At",
        dataField: "created_at",
        format: "longDateLongTime",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        caption: "Effective Date",
        dataField: "effective_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
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
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
          />
        ),
      },
      {
        dataField: "type",
        caption: "Type",
        width: 140,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(PaymentTypeEnum).map((paymentType) => ({
                type: paymentType,
                label: PaymentTypeToLabel[paymentType],
              })),
              key: "type",
            },
          },
          valueExpr: "type",
          displayExpr: "label",
        },
      },
      {
        caption: "Amount",
        dataField: "amount",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        caption: "To Principal",
        dataField: "to_principal",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        caption: "To Interest",
        dataField: "to_interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        caption: "To Fees",
        dataField: "to_fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [isMiniTable]
  );

  return (
    <ControlledDataGrid
      pager
      dataSource={rows}
      filtering={{ enable: true }}
      columns={columns}
      isExcelExport={isExcelExport}
    />
  );
}

export default TransactionsDataGrid;
