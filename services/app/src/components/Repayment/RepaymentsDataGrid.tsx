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
import { addBizDays } from "lib/date";
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
  isExcelExport = true,
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
        expected_deposit_date: !!payment.payment_date
          ? addBizDays(
              payment.payment_date,
              payment.method === PaymentMethodEnum.ReverseDraftACH ? 1 : 0
            )
          : null,
        submitted_by_name: payment.submitted_by_user?.full_name,
      })),
    [isOther, payments]
  );
  const columns = useMemo(
    () => [
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
        dataField: "submitted_at",
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
        dataField: "submitted_by_name",
        caption: "Submitted By",
        minWidth: ColumnWidths.MinWidth,
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
        caption: "Payor Name",
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
        visible: isMethodVisible,
        dataField: "method",
        caption: "Method",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({ method }: PaymentLimitedFragment) =>
          PaymentMethodToLabel[method as PaymentMethodEnum],
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
        dataField: "expected_deposit_date",
        caption: "Expected Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.expected_deposit_date}
          />
        ),
      },
      {
        visible: isClosed,
        dataField: "deposit_date",
        caption: "Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.deposit_date} />
        ),
      },
      {
        visible: isClosed,
        dataField: "settlement_date",
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

export default RepaymentsDataGrid;
