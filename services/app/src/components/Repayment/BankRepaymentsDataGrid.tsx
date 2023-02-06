import { Box, Button, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  PaymentLimitedFragment,
  PaymentWithTransactionsFragment,
  Payments,
  RepaymentForBankDataGridFragment,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { addBizDays, parseDateStringServer } from "lib/date";
import {
  ProductTypeEnum,
  ProductTypeToLabel,
  RepaymentMethodEnum,
  RepaymentMethodToLabel,
  RepaymentTypeEnum,
} from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { sumBy } from "lodash";
import { useMemo, useState } from "react";

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isHoldingAccountVisible?: boolean;
  isAppliedToVisible?: boolean;
  repaymentType?: RepaymentTypeEnum;
  payments: RepaymentForBankDataGridFragment[];
  selectedPaymentIds?: Payments["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
  handleClickPaymentBankNote?: (repaymentId: Payments["id"]) => void;
}

export default function RepaymentsDataGrid({
  isCompanyVisible = false,
  isHoldingAccountVisible = false,
  isExcelExport = true,
  isMethodVisible = true,
  isMultiSelectEnabled = false,
  isAppliedToVisible = false,
  repaymentType = RepaymentTypeEnum.Other,
  payments,
  selectedPaymentIds,
  handleClickCustomer,
  handleSelectPayments,
  handleClickPaymentBankNote,
}: Props) {
  const isClosed = repaymentType === RepaymentTypeEnum.Closed;
  const isRequestedReverseDraftACH =
    repaymentType === RepaymentTypeEnum.RequestedReverseDraftACH;
  const isReverseDraftACH = repaymentType === RepaymentTypeEnum.ReverseDraftACH;
  const isOther = repaymentType === RepaymentTypeEnum.Other;
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(
    () =>
      payments.map((payment) => {
        return formatRowModel({
          ...payment,
          amount: isOther ? payment.requested_amount : payment.amount,
          applied_to_interest: (payment as PaymentWithTransactionsFragment)
            .transactions?.length
            ? sumBy(
                (payment as PaymentWithTransactionsFragment).transactions,
                "to_interest"
              )
            : undefined,
          applied_to_late_fees: (payment as PaymentWithTransactionsFragment)
            .transactions?.length
            ? sumBy(
                (payment as PaymentWithTransactionsFragment).transactions,
                "to_fees"
              )
            : undefined,
          applied_to_principal: (payment as PaymentWithTransactionsFragment)
            .transactions?.length
            ? sumBy(
                (payment as PaymentWithTransactionsFragment).transactions,
                "to_principal"
              )
            : undefined,
          deposit_date: !!payment.deposit_date
            ? parseDateStringServer(payment.deposit_date)
            : null,
          expected_deposit_date: !!payment.payment_date
            ? parseDateStringServer(
                addBizDays(
                  payment.payment_date,
                  payment.method === RepaymentMethodEnum.ReverseDraftACH ? 1 : 0
                )
              )
            : null,
          forecasted_account_fees:
            payment.items_covered.requested_to_account_fees || 0,
          forecasted_holding_account:
            payment.items_covered.forecasted_holding_account || 0,
          forecasted_interest: payment.items_covered.forecasted_interest || 0,
          forecasted_late_fees: payment.items_covered.forecasted_late_fees || 0,
          forecasted_principal: payment.items_covered.forecasted_principal || 0,
          method:
            RepaymentMethodToLabel[payment.method as RepaymentMethodEnum] ||
            null,
          payor_name:
            getCompanyDisplayName(payment.invoice?.payor, "") ||
            payment.company.name,
          product_type: !!payment?.company?.most_recent_financial_summary?.[0]
            ?.product_type
            ? payment.company.most_recent_financial_summary[0].product_type
            : null,
          requested_payment_date: !!payment.requested_payment_date
            ? parseDateStringServer(payment.requested_payment_date)
            : null,
          settlement_date: !!payment.settlement_date
            ? parseDateStringServer(payment.settlement_date)
            : null,
          submitted_at: !!payment.submitted_at
            ? parseDateStringServer(payment.submitted_at)
            : null,
          submitted_by_name: payment.submitted_by_user?.full_name,
        });
      }),
    [isOther, payments]
  );
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "id",
        caption: "Payment ID",
        width: 140,
        cellRender: (params: GridValueFormatterParams) => (
          <PaymentDrawerLauncher paymentId={params.row.data.id} showBankInfo />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
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
        visible: isRequestedReverseDraftACH,
        dataField: "requested_payment_date",
        caption: "Requested Deposit Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isReverseDraftACH || isOther,
        dataField: "expected_deposit_date",
        caption: "Expected Deposit Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isRequestedReverseDraftACH,
        dataField: "requested_amount",
        caption: "Requested Total Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
      {
        visible: !isRequestedReverseDraftACH,
        dataField: "amount",
        caption: "Expected Total Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
        alignment: "center",
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(ProductTypeEnum).map((product) => ({
                product_type: product,
                label: ProductTypeToLabel[product],
              })),
              key: "product_type",
            },
          },
          valueExpr: "product_type",
          displayExpr: "label",
        },
      },
      {
        visible: isMethodVisible,
        dataField: "method",
        caption: "Method",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        visible: isAppliedToVisible,
        dataField: "applied_to_principal",
        caption: "Applied to Principal",
        minWidth: ColumnWidths.MinWidth,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isAppliedToVisible,
        dataField: "applied_to_interest",
        caption: "Applied to Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isAppliedToVisible,
        dataField: "applied_to_late_fees",
        caption: "Applied to Late Fees",
        minWidth: ColumnWidths.MinWidth,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: !isAppliedToVisible,
        dataField: "forecasted_principal",
        caption: "Applied to Principal",
        minWidth: ColumnWidths.MinWidth,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: !isAppliedToVisible,
        dataField: "forecasted_interest",
        caption: "Applied to Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: !isAppliedToVisible,
        dataField: "forecasted_late_fees",
        caption: "Applied to Late Fees",
        minWidth: ColumnWidths.MinWidth,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "forecasted_account_fees",
        caption: "Applied to Account Fees",
        minWidth: ColumnWidths.MinWidth,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isHoldingAccountVisible,
        dataField: "forecasted_holding_account",
        caption: "Applied to Holding Account",
        minWidth: ColumnWidths.MinWidth,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "submitted_at",
        caption: "Submitted At",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "submitted_by_name",
        caption: "Submitted By",
        width: ColumnWidths.UserName,
      },
      {
        dataField: "payor_name",
        caption: "Payor Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        visible: isClosed,
        dataField: "deposit_date",
        caption: "Deposit Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isClosed,
        dataField: "settlement_date",
        caption: "Settlement Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: !isRequestedReverseDraftACH && !isOther,
        caption: "Bank Note",
        dataField: "bank_note",
        width: 340,
        cellRender: (params: GridValueFormatterParams) =>
          params.row.data.bank_note !== "N/A" ? (
            <Button
              color="default"
              variant="text"
              style={{
                minWidth: 0,
                textAlign: "left",
              }}
              onClick={() => {
                !!handleClickPaymentBankNote &&
                  handleClickPaymentBankNote(params.row.data.id);
              }}
            >
              <Box display="flex" alignItems="center">
                <CommentIcon />
                {!!params.row.data.bank_note && (
                  <Box ml={1}>
                    <Typography variant="body2">
                      {params.row.data.bank_note}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Button>
          ) : (
            params.row.data.bank_note
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
      handleClickCustomer,
      handleClickPaymentBankNote,
      isHoldingAccountVisible,
      isAppliedToVisible,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
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
      filtering={{ enable: true }}
      ref={(ref) => setDataGrid(ref)}
      selectedRowKeys={selectedPaymentIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
