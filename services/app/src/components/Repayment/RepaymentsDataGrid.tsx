import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import { Companies, PaymentLimitedFragment, Payments } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
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
  payments: PaymentLimitedFragment[];
  customerSearchQuery?: string;
  actionItems?: DataGridActionItem[];
  selectedPaymentIds?: Payments["id"][];
  onClickCustomerName?: (customerId: Companies["id"]) => void;
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
}

function RepaymentsDataGrid({
  isCompanyVisible = false,
  isExcelExport = false,
  isMethodVisible = true,
  isMultiSelectEnabled = false,
  repaymentType = RepaymentTypeEnum.Other,
  payments,
  customerSearchQuery = "",
  actionItems,
  selectedPaymentIds,
  onClickCustomerName,
  handleSelectPayments,
}: Props) {
  const isClosed = repaymentType === RepaymentTypeEnum.Closed;
  const isRequestedReverseDraftACH =
    repaymentType === RepaymentTypeEnum.RequestedReverseDraftACH;
  const isReverseDraftACH = repaymentType === RepaymentTypeEnum.ReverseDraftACH;
  const isOther = repaymentType === RepaymentTypeEnum.Other;
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(
    () =>
      payments.map((payment) => ({
        ...payment,
        amount: isOther ? payment.requested_amount : payment.amount,
      })),
    [isOther, payments]
  );
  const columns = useMemo(
    () => [
      {
        caption: "Submitted At",
        width: ColumnWidths.Date,
        alignment: "right",
        calculateCellValue: ({ submitted_at }: PaymentLimitedFragment) =>
          submitted_at,
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.submitted_at}
          />
        ),
      },
      {
        dataField: "id",
        caption: "Payment ID",
        width: 140,
        calculateCellValue: ({ id }: PaymentLimitedFragment) => id,
        cellRender: (params: ValueFormatterParams) => (
          <PaymentDrawerLauncher paymentId={params.row.data.id as string} />
        ),
      },
      {
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        minWidth: 100,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        visible: isCompanyVisible,
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({ company }: any) => company?.name,
        cellRender: (params: ValueFormatterParams) =>
          onClickCustomerName ? (
            <ClickableDataGridCell
              label={params.row.data.company.name}
              onClick={() => {
                if (onClickCustomerName) {
                  onClickCustomerName(params.row.data.company.id);
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
        caption: "Payor",
        width: ColumnWidths.MinWidth,
        calculateCellValue: ({ invoice, company }: any) =>
          invoice?.payor.name || company?.name,
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {params.row.data.invoice?.payor.name ||
              params.row.data.company?.name}
          </Box>
        ),
      },
      {
        visible: true || isMethodVisible,
        dataField: "method",
        caption: "Method",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({ method }: PaymentLimitedFragment) => method,
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {PaymentMethodToLabel[params.row.data.method as PaymentMethodEnum]}
          </Box>
        ),
      },
      {
        visible: isRequestedReverseDraftACH,
        dataField: "requested_amount",
        caption: "Requested Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        calculateCellValue: ({ requested_amount }: any) => requested_amount,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.requested_amount} />
        ),
      },
      {
        visible: !isRequestedReverseDraftACH,
        dataField: "amount",
        caption: "Expected Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        calculateCellValue: ({ amount }: PaymentLimitedFragment) => amount,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: isRequestedReverseDraftACH,
        dataField: "requested_payment_date",
        caption: "Requested Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        calculateCellValue: ({
          requested_payment_date,
        }: PaymentLimitedFragment) => requested_payment_date,
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: isReverseDraftACH || isOther,
        caption: "Expected Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        calculateCellValue: ({ payment_date }: PaymentLimitedFragment) =>
          payment_date,
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.payment_date} />
        ),
      },
      {
        visible: isClosed,
        caption: "Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        calculateCellValue: ({ deposit_date }: any) => deposit_date,
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.deposit_date} />
        ),
      },
      {
        visible: isClosed,
        caption: "Settlement Date",
        width: ColumnWidths.Date,
        alignment: "right",
        calculateCellValue: ({ settlement_date }: PaymentLimitedFragment) =>
          settlement_date,
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.settlement_date} />
        ),
      },
    ],
    [
      dataGrid?.instance,
      isCompanyVisible,
      isMethodVisible,
      isClosed,
      isRequestedReverseDraftACH,
      isReverseDraftACH,
      isOther,
      actionItems,
      onClickCustomerName,
    ]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectPayments &&
      handleSelectPayments(selectedRowsData as PaymentLimitedFragment[]),
    [handleSelectPayments]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
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
    </Box>
  );
}

export default RepaymentsDataGrid;
