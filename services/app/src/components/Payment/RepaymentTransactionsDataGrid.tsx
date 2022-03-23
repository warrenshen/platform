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
import { RepaymentMethodEnum, RepaymentMethodToLabel } from "lib/enum";
import {
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
} from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { flatten, sumBy } from "lodash";
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
      company_id: payment.company_id,
      company_identifier: payment.company.identifier,
      company_name: payment.company.name,
      status: !!payment.reversed_at ? "Reversed" : "Settled",
      payment: payment,
      to_principal_sum: payment.transactions?.length
        ? sumBy(payment.transactions, "to_principal")
        : null,
      to_interest_sum: payment.transactions?.length
        ? sumBy(payment.transactions, "to_interest")
        : null,
    }));
  } else {
    return flatten(
      payments.map((payment) =>
        !!payment.reversed_at
          ? [
              {
                id: `${payment.id}-0`,
                company_id: payment.company_id,
                company_identifier: payment.company.identifier,
                company_name: payment.company.name,
                status: "Reversed",
                payment: payment,
              },
            ]
          : payment.transactions.map((transaction) => ({
              id: `${payment.id}-${transaction.id}`,
              company_id: payment.company_id,
              company_identifier: payment.company.identifier,
              company_name: payment.company.name,
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
}

export default function RepaymentTransactionsDataGrid({
  isCompanyVisible = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isLineOfCredit = false,
  isMultiSelectEnabled = false,
  payments,
  selectedPaymentIds,
  handleClickCustomer = () => {},
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
        visible: !isLineOfCredit,
        dataField: "transaction.to_principal",
        caption: "Transaction To Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={
              params.row.data.transaction?.to_principal != null
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
        visible: isLineOfCredit,
        dataField: "to_principal_sum",
        caption: "Applied to Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_principal_sum} />
        ),
      },
      {
        visible: isLineOfCredit,
        dataField: "to_interest_sum",
        caption: "Applied to Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.to_interest_sum} />
        ),
      },
    ],
    [isCompanyVisible, isLineOfCredit, handleClickCustomer]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectPayments &&
      handleSelectPayments(selectedRowsData as PaymentLimitedFragment[]),
    [handleSelectPayments]
  );

  const filtering = useMemo(() => ({ enable: isFilteringEnabled }), [
    isFilteringEnabled,
  ]);

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
