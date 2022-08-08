import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  GetRepaymentsForCompanyQuery,
  LoanLimitedFragment,
  PaymentLimitedFragment,
  Payments,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  PaymentTypeEnum,
  RepaymentMethodEnum,
  RepaymentMethodToLabel,
} from "lib/enum";
import {
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
} from "lib/loans";
import { formatCurrency } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { flatten, sumBy } from "lodash";
import { useMemo } from "react";

function getRows(
  isLineOfCredit: boolean,
  payments: NonNullable<
    GetRepaymentsForCompanyQuery["companies_by_pk"]
  >["payments"]
) {
  if (isLineOfCredit) {
    return payments.map((payment) => {
      return formatRowModel({
        adjusted_maturity_date: !!payment.transactions?.[0]?.loan
          ?.adjusted_maturity_date
          ? parseDateStringServer(
              payment.transactions[0].loan.adjusted_maturity_date
            )
          : null,
        company_id: payment.company_id,
        company_identifier: payment.company.identifier,
        company_name: payment.company.name,
        id: payment.id,
        payment: payment,
        status: !!payment.reversed_at ? "Reversed" : "Settled",
        to_account_fees: payment.items_covered?.requested_to_account_fees
          ? formatCurrency(payment.items_covered.requested_to_account_fees)
          : formatCurrency(0),
        to_interest_sum: payment.transactions?.length
          ? formatCurrency(sumBy(payment.transactions, "to_interest"))
          : null,
        to_principal_sum: payment.transactions?.length
          ? formatCurrency(sumBy(payment.transactions, "to_principal"))
          : null,
      });
    });
  } else {
    return flatten(
      payments.map((payment) =>
        !!payment.reversed_at
          ? [
              formatRowModel({
                company_id: payment.company_id,
                company_identifier: payment.company.identifier,
                company_name: payment.company.name,
                id: `${payment.id}-0`,
                payment: payment,
                status: "Reversed",
              }),
            ]
          : payment.transactions.map((transaction) =>
              formatRowModel({
                adjusted_maturity_date: !!transaction.loan
                  ?.adjusted_maturity_date
                  ? parseDateStringServer(
                      transaction.loan.adjusted_maturity_date
                    )
                  : null,
                company_id: payment.company_id,
                company_identifier: payment.company.identifier,
                company_name: payment.company.name,
                id: `${payment.id}-${transaction.id}`,
                payment: payment,
                repayment_id: payment.id,
                status: "Settled",
                to_account_fees:
                  transaction?.type === PaymentTypeEnum.RepaymentOfAccountFee
                    ? formatCurrency(transaction.amount)
                    : formatCurrency(0),
                to_interest_sum:
                  transaction?.to_interest != null
                    ? formatCurrency(transaction.to_interest)
                    : null,
                to_late_fees:
                  transaction?.to_fees != null
                    ? formatCurrency(transaction.to_fees)
                    : null,
                to_principal_sum:
                  transaction?.to_principal != null
                    ? formatCurrency(transaction.to_principal)
                    : null,
                transaction: {
                  ...transaction,
                  loan: {
                    ...transaction.loan,
                    artifact_name: transaction.loan
                      ? getLoanArtifactName(transaction.loan)
                      : "N/A",
                  },
                },
              })
            )
      )
    );
  }
}

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isLineOfCredit?: boolean; // If LOC, simply show payments instead of payments broken down by transactions.
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  payments: NonNullable<
    GetRepaymentsForCompanyQuery["companies_by_pk"]
  >["payments"];
  selectedPaymentIds?: Payments["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
  handleClickPaymentBankNote?: (repaymentId: Payments["id"]) => void;
}

export default function CustomerRepaymentTransactionsDataGrid({
  isCompanyVisible = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isLineOfCredit = false,
  isMultiSelectEnabled = false,
  payments,
  selectedPaymentIds,
  handleClickCustomer = () => {},
  handleSelectPayments,
  handleClickPaymentBankNote,
}: Props) {
  const rows = useMemo(
    () => getRows(isLineOfCredit, payments),
    [isLineOfCredit, payments]
  );
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
            label={
              isCompanyVisible
                ? `${params.row.data.company_identifier}-R${params.row.data.payment.settlement_identifier}`
                : `R${params.row.data.payment.settlement_identifier}`
            }
          />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Customer Name",
        height: 40,
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company_name}
              onClick={() =>
                handleClickCustomer &&
                handleClickCustomer(params.row.data.company_id)
              }
            />
          ) : (
            params.row.data.company.name
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
        }) => RepaymentMethodToLabel[payment.method as RepaymentMethodEnum],
      },
      {
        dataField: "adjusted_maturity_date",
        caption: "Maturity Date",
        width: ColumnWidths.Date,
        alignment: "right",
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
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.transaction?.loan?.purchase_order ? (
            <PurchaseOrderDrawerLauncher
              label={params.row.data.transaction.loan.artifact_name}
              isMetrcBased={
                params.row.data.transaction.loan.purchase_order.is_metrc_based
              }
              purchaseOrderId={params.row.data.transaction.loan.artifact_id}
            />
          ) : params.row.data.transaction?.loan?.invoice ? (
            <InvoiceDrawerLauncher
              label={params.row.data.transaction.loan.artifact_name}
              invoiceId={params.row.data.transaction.loan.artifact_id}
            />
          ) : params.row.data.line_of_credit ? (
            "N/A"
          ) : null,
      },
      {
        visible: !isLineOfCredit,
        dataField: "payment.amount",
        caption: "Total Repayment Amount",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.payment.amount} />
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
        visible: isLineOfCredit,
        dataField: "payment.amount",
        caption: "Total Repayment Amount",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.payment.amount} />
        ),
      },
      {
        dataField: "to_principal_sum",
        caption: "Applied to Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "to_interest_sum",
        caption: "Applied to Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: !isLineOfCredit,
        dataField: "to_late_fees",
        caption: "Applied to Late Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "to_account_fees",
        caption: "Applied to Account Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [isCompanyVisible, isLineOfCredit, handleClickCustomer]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectPayments &&
        handleSelectPayments(selectedRowsData as PaymentLimitedFragment[]),
    [handleSelectPayments]
  );

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      filtering={filtering}
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
