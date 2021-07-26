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
  GetRepaymentsForCompanyQuery,
  LoanLimitedFragment,
  PaymentLimitedFragment,
  Payments,
} from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import {
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
} from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { flatten } from "lodash";
import { useMemo } from "react";

function getRows(
  isLineOfCredit: boolean,
  payments: NonNullable<
    GetRepaymentsForCompanyQuery["companies_by_pk"]
  >["payments"]
) {
  if (isLineOfCredit) {
    return payments.map((payment) => ({
      id: payment.id,
      status: !!payment.reversed_at ? "Reversed" : "Settled",
      payment: payment,
    }));
  } else {
    return flatten(
      payments.map((payment) =>
        !!payment.reversed_at
          ? [
              {
                id: `${payment.id}-0`,
                status: "Reversed",
                payment: payment,
              },
            ]
          : payment.transactions.map((transaction) => ({
              id: `${payment.id}-${transaction.id}`,
              status: "Settled",
              payment: payment,
              transaction: {
                ...transaction,
                loan: {
                  ...transaction.loan,
                  artifact_name: transaction.loan
                    ? getLoanArtifactName(transaction.loan)
                    : "N/A",
                },
              },
            }))
      )
    );
  }
}

interface Props {
  isExcelExport?: boolean;
  isLineOfCredit?: boolean; // If LOC, simply show payments instead of payments broken down by transactions.
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  payments: NonNullable<
    GetRepaymentsForCompanyQuery["companies_by_pk"]
  >["payments"];
  selectedPaymentIds?: Payments["id"][];
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
}

export default function RepaymentTransactionsDataGrid({
  isExcelExport = true,
  isLineOfCredit = false,
  isMultiSelectEnabled = false,
  payments,
  selectedPaymentIds,
  handleSelectPayments,
}: Props) {
  const rows = useMemo(() => getRows(isLineOfCredit, payments), [
    isLineOfCredit,
    payments,
  ]);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "payment.settlement_identifier",
        caption: "Repayment #",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <PaymentDrawerLauncher
            paymentId={params.row.data.payment.id}
            label={`P${params.row.data.payment.settlement_identifier}`}
          />
        ),
      },
      {
        dataField: "status",
        caption: "Repayment Status",
        width: ColumnWidths.Status,
      },
      {
        dataField: "payment.method",
        caption: "Repayment Method",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({
          payment,
        }: {
          payment: PaymentLimitedFragment;
        }) => PaymentMethodToLabel[payment.method as PaymentMethodEnum],
      },
      {
        dataField: "payment.amount",
        caption: "Total Amount",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.payment.amount} />
        ),
      },
      {
        dataField: "payment.deposit_date",
        caption: "Deposit Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.payment.deposit_date} />
        ),
      },
      {
        dataField: "payment.settlement_date",
        caption: "Settlement Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.payment.settlement_date}
          />
        ),
      },
      {
        visible: !isLineOfCredit,
        dataField: "transaction.loan.disbursement_identifier",
        caption: "Loan Disbursement Identifier",
        width: ColumnWidths.Identifier,
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {params.row.data.transaction?.loan ? (
              <LoanDrawerLauncher
                label={createLoanDisbursementIdentifier(
                  params.row.data.transaction.loan as LoanLimitedFragment
                )}
                loanId={params.row.data.transaction.loan.id as string}
              />
            ) : (
              "N/A"
            )}
          </Box>
        ),
      },
      {
        visible: !isLineOfCredit,
        dataField: "transaction.loan.artifact_name",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            {params.row.data.transaction?.loan?.purchase_order && (
              <PurchaseOrderDrawerLauncher
                label={params.row.data.transaction.loan.artifact_name as string}
                purchaseOrderId={
                  params.row.data.transaction.loan.artifact_id as string
                }
              />
            )}
            {params.row.data.transaction?.loan?.invoice && (
              <InvoiceDrawerLauncher
                label={params.row.data.transaction.loan.artifact_name as string}
                invoiceId={
                  params.row.data.transaction.loan.artifact_id as string
                }
              />
            )}
            {params.row.data.line_of_credit && "N/A"}
          </Box>
        ),
      },
      {
        visible: !isLineOfCredit,
        dataField: "transaction.amount",
        caption: "Transaction Total Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.transaction?.amount || null}
          />
        ),
      },
      {
        visible: !isLineOfCredit,
        dataField: "transaction.to_principal",
        caption: "Transaction To Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={
              params.row.data.transaction?.to_principal
                ? params.row.data.transaction.to_principal
                : null
            }
          />
        ),
      },
      {
        visible: !isLineOfCredit,
        dataField: "transaction.to_interest",
        caption: "Transaction To Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={
              params.row.data.transaction?.to_interest != null
                ? params.row.data.transaction.to_interest
                : null
            }
          />
        ),
      },
      {
        visible: !isLineOfCredit,
        dataField: "transaction.to_fees",
        caption: "Transaction To Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={
              params.row.data.transaction?.to_fees != null
                ? params.row.data.transaction.to_fees
                : null
            }
          />
        ),
      },
    ],
    [isLineOfCredit]
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
      selectedRowKeys={selectedPaymentIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
