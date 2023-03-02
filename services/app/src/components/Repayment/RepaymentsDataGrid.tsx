import { GridValueFormatterParams } from "@material-ui/data-grid";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  PaymentLimitedFragment,
  PaymentWithTransactionsFragment,
  Payments,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { addBizDays, parseDateStringServer } from "lib/date";
import {
  RepaymentMethodEnum,
  RepaymentMethodToLabel,
  RepaymentTypeEnum,
} from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { sumBy } from "lodash";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isHoldingAccountVisible?: boolean;
  repaymentType?: RepaymentTypeEnum;
  payments: PaymentLimitedFragment[];
  selectedPaymentIds?: Payments["id"][];
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
}

export default function RepaymentsDataGrid({
  isHoldingAccountVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  repaymentType = RepaymentTypeEnum.Other,
  payments,
  selectedPaymentIds,
  handleSelectPayments,
}: Props) {
  const isReverseDraftACH = repaymentType === RepaymentTypeEnum.ReverseDraftACH;
  const isOther = repaymentType === RepaymentTypeEnum.Other;
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
        visible: isReverseDraftACH || isOther,
        dataField: "requested_payment_date",
        caption: "Requested Deposit Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isReverseDraftACH || isOther,
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
        dataField: "method",
        caption: "Method",
        minWidth: ColumnWidths.MinWidth,
      },
      {
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
    ],
    [isReverseDraftACH, isOther, isHoldingAccountVisible]
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
      selectedRowKeys={selectedPaymentIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
