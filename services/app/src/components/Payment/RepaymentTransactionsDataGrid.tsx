import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  LoanLimitedFragment,
  PaymentLimitedFragment,
  Payments,
  TransactionFragment,
} from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { createLoanDisbursementIdentifier } from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  transactions: TransactionFragment[];
  selectedPaymentIds?: Payments["id"][];
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
}

export default function RepaymentTransactionsDataGrid({
  isExcelExport = false,
  isMultiSelectEnabled = false,
  transactions,
  selectedPaymentIds,
  handleSelectPayments,
}: Props) {
  const rows = transactions;
  const columns = useMemo(
    () => [
      {
        dataField: "payment.settlement_identifier",
        caption: "Payment #",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <PaymentDrawerLauncher
            paymentId={params.row.data.payment.id}
            label={
              `P${params.row.data.payment.settlement_identifier}` as string
            }
          />
        ),
      },
      {
        dataField: "payment.method",
        caption: "Payment Method",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({
          payment,
        }: {
          payment: PaymentLimitedFragment;
        }) => PaymentMethodToLabel[payment.method as PaymentMethodEnum],
      },
      {
        dataField: "payment.amount",
        caption: "Payment Total Amount",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.payment.amount} />
        ),
      },
      {
        dataField: "payment.deposit_date",
        caption: "Payment Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.payment.deposit_date} />
        ),
      },
      {
        dataField: "payment.settlement_date",
        caption: "Payment Settlement Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.payment.settlement_date}
          />
        ),
      },
      {
        dataField: "loan.disbursement_identifier",
        caption: "Loan Disbursement Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {params.row.data.loan ? (
              <LoanDrawerLauncher
                label={createLoanDisbursementIdentifier(
                  params.row.data.loan as LoanLimitedFragment
                )}
                loanId={params.row.data.loan.id as string}
              />
            ) : (
              "N/A"
            )}
          </Box>
        ),
      },
      {
        dataField: "loan.artifact_id",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            {params.row.data.loan?.purchase_order && (
              <PurchaseOrderDrawerLauncher
                label={
                  params.row.data.loan.purchase_order.order_number as string
                }
                purchaseOrderId={
                  params.row.data.loan.purchase_order.id as string
                }
              />
            )}
            {params.row.data.loan?.invoice && (
              <InvoiceDrawerLauncher
                label={params.row.data.loan.invoice.invoice_number as string}
                invoiceId={params.row.data.loan.invoice.id as string}
              />
            )}
            {params.row.data.line_of_credit && "N/A"}
          </Box>
        ),
      },
      {
        dataField: "amount",
        caption: "Transaction Total Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        caption: "Transaction To Principal",
        dataField: "to_principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_principal} />
        ),
      },
      {
        caption: "Transaction To Interest",
        dataField: "to_interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_interest} />
        ),
      },
      {
        caption: "Transaction To Fees",
        dataField: "to_fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_fees} />
        ),
      },
    ],
    []
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
        selectedRowKeys={selectedPaymentIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </Box>
  );
}
