import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  PaymentLimitedFragment,
  Payments,
  TransactionFragment,
  Transactions,
} from "generated/graphql";
import { formatDateString, formatDatetimeString } from "lib/date";
import {
  PaymentTypeEnum,
  PaymentTypeToLabel,
  TransactionSubTypeEnum,
  TransactionSubTypeToLabel,
} from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

export enum RepaymentTypeEnum {
  Closed = "closed",
  RequestedReverseDraftACH = "requested-reverse-draft-ach",
  ReverseDraftACH = "reverse-draft-ach",
  Other = "other",
}

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  repaymentType?: RepaymentTypeEnum;
  fees: (PaymentLimitedFragment & {
    transactions: Array<Pick<Transactions, "id"> & TransactionFragment>;
  })[];
  selectedPaymentIds?: Payments["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectFees?: (payments: PaymentLimitedFragment[]) => void;
}

function getRows(
  fees: (PaymentLimitedFragment & {
    transactions: Array<Pick<Transactions, "id"> & TransactionFragment>;
  })[]
): RowsProp {
  return fees.map((fee) => ({
    ...fee,
    amount: (fee.type === PaymentTypeEnum.FeeWaiver ? -1 : 1) * fee.amount,
    fee_name: fee.transactions[0]?.subtype
      ? TransactionSubTypeToLabel[
          fee.transactions[0]?.subtype as TransactionSubTypeEnum
        ]
      : "",
    fee_type: PaymentTypeToLabel[fee.type as PaymentTypeEnum],
    settlement_date: !!fee.settlement_date
      ? formatDateString(fee.settlement_date)
      : "-",
    submitted_at: !!fee.submitted_at
      ? formatDatetimeString(fee.submitted_at)
      : "-",
  }));
}

export default function FeesDataGrid({
  isCompanyVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  fees,
  selectedPaymentIds,
  handleClickCustomer,
  handleSelectFees,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(() => getRows(fees), [fees]);

  const columns = useMemo(
    () => [
      {
        caption: "",
        dataField: "fee_type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Description",
        dataField: "fee_name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        visible: false,
        caption: "Submitted At",
        dataField: "submitted_at",
        width: ColumnWidths.Datetime,
        format: "shortDate",
      },
      {
        visible: isCompanyVisible,
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({ company }: any) => company?.name,
        cellRender: (params: ValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company.name}
              onClick={() => {
                if (handleClickCustomer) {
                  handleClickCustomer(params.row.data.company.id);
                  dataGrid?.instance.filter([
                    "company.name",
                    "=",
                    params.row.data.company.name,
                  ]);
                }
              }}
            />
          ) : (
            params.row.data.company.name
          ),
      },
      {
        caption: "Effective Date",
        width: ColumnWidths.Date,
        alignment: "right",
        dataField: "settlement_date",
        format: "shortDate",
      },
      {
        dataField: "amount",
        caption: "Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
    ],
    [dataGrid?.instance, isCompanyVisible, handleClickCustomer]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectFees &&
        handleSelectFees(selectedRowsData as PaymentLimitedFragment[]),
    [handleSelectFees]
  );

  return (
    <ControlledDataGrid
      pager
      select={isMultiSelectEnabled}
      isExcelExport={isExcelExport}
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
      selectedRowKeys={selectedPaymentIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
