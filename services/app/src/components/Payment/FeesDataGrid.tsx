import { GridValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  PaymentLimitedFragment,
  Payments,
  TransactionFragment,
  Transactions,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  PaymentTypeEnum,
  PaymentTypeToLabel,
  TransactionSubTypeEnum,
  TransactionSubTypeToLabel,
} from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
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
) {
  const validFeeTypes = [
    PaymentTypeEnum.Fee,
    PaymentTypeEnum.FeeWaiver,
    PaymentTypeEnum.RepaymentOfAccountFee,
  ];

  const negativeFeeTypes = [
    PaymentTypeEnum.FeeWaiver,
    PaymentTypeEnum.RepaymentOfAccountFee,
  ];

  const filteredFees = fees
    .map((fee) => {
      return !!fee?.transactions ? fee.transactions : [];
    })
    .flat()
    .filter((fee) => {
      return validFeeTypes.indexOf(fee.type as PaymentTypeEnum) > -1;
    });

  return filteredFees.map((fee) => {
    return formatRowModel({
      ...fee,
      amount:
        negativeFeeTypes.indexOf(fee.type as PaymentTypeEnum) > -1
          ? -1 * fee.amount
          : fee.amount,
      fee_name: !!fee?.subtype ? fee.subtype : fee.type,
      fee_type: fee.type,
      settlement_date: !!fee.effective_date
        ? parseDateStringServer(fee.effective_date)
        : null,
    });
  });
}

const acccountFeeTypes = [
  PaymentTypeEnum.Fee,
  PaymentTypeEnum.FeeWaiver,
  PaymentTypeEnum.RepaymentOfAccountFee,
];

const acccountFeeNames = [
  PaymentTypeEnum.Fee,
  PaymentTypeEnum.FeeWaiver,
  PaymentTypeEnum.RepaymentOfAccountFee,
  TransactionSubTypeEnum.CustomFee,
  TransactionSubTypeEnum.MinimumInterestFee,
  TransactionSubTypeEnum.WireFee,
];

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
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: acccountFeeTypes.map((feeType) => ({
                fee_type: feeType,
                label: PaymentTypeToLabel[feeType as PaymentTypeEnum],
              })),
              key: "fee_type",
            },
          },
          valueExpr: "fee_type",
          displayExpr: "label",
        },
      },
      {
        caption: "Description",
        dataField: "fee_name",
        minWidth: ColumnWidths.MinWidth,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: acccountFeeNames.map((feeName) => ({
                fee_name: feeName,
                label: Object.values(PaymentTypeEnum)
                  .map((value) => value as string)
                  .includes(feeName.valueOf())
                  ? PaymentTypeToLabel[feeName as PaymentTypeEnum]
                  : TransactionSubTypeToLabel[
                      feeName as TransactionSubTypeEnum
                    ],
              })),
              key: "fee_name",
            },
          },
          valueExpr: "fee_name",
          displayExpr: "label",
        },
      },
      {
        visible: isCompanyVisible,
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({ company }: any) => company?.name,
        cellRender: (params: GridValueFormatterParams) =>
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
      filtering={{ enable: true }}
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
      selectedRowKeys={selectedPaymentIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
