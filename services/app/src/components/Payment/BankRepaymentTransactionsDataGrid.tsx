import { Box, Button, Typography } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
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
  GetRepaymentsSubscription,
  LoanLimitedFragment,
  PaymentLimitedFragment,
  Payments,
} from "generated/graphql";
import {
  PaymentTypeEnum,
  ProductTypeEnum,
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

function getRows(payments: NonNullable<GetRepaymentsSubscription>["payments"]) {
  return flatten(
    payments.map((payment) => {
      const productType = !!payment?.company?.financial_summaries?.[0]
        ?.product_type
        ? payment.company.financial_summaries[0].product_type
        : null;

      return !!payment.reversed_at
        ? [
            formatRowModel({
              bank_note: payment.bank_note,
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
              bank_note: payment.bank_note,
              company_id: payment.company_id,
              company_identifier: payment.company.identifier,
              company_name: payment.company.name,
              id: `${payment.id}-${transaction.id}`,
              payment: payment,
              repayment_id: payment.id,
              status: "Settled",
              to_account_fees:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? payment.items_covered?.requested_to_account_fees
                    ? formatCurrency(
                        payment.items_covered.requested_to_account_fees
                      )
                    : formatCurrency(0)
                  : transaction?.type === PaymentTypeEnum.RepaymentOfAccountFee
                  ? formatCurrency(transaction.amount)
                  : formatCurrency(0),
              to_interest_sum:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? payment.transactions?.length
                    ? formatCurrency(sumBy(payment.transactions, "to_interest"))
                    : null
                  : transaction?.to_interest != null
                  ? formatCurrency(transaction.to_interest)
                  : null,
              to_late_fees:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? formatCurrency(0)
                  : transaction?.to_fees != null
                  ? formatCurrency(transaction.to_fees)
                  : null,
              to_principal_sum:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? payment.transactions?.length
                    ? formatCurrency(
                        sumBy(payment.transactions, "to_principal")
                      )
                    : null
                  : transaction?.to_principal != null
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
          );
    })
  );
}

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  payments: NonNullable<GetRepaymentsSubscription>["payments"];
  selectedPaymentIds?: Payments["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
  handleClickPaymentBankNote?: (repaymentId: Payments["id"]) => void;
}

export default function BankRepaymentTransactionsDataGrid({
  isCompanyVisible = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isMultiSelectEnabled = false,
  payments,
  selectedPaymentIds,
  handleClickCustomer = () => {},
  handleSelectPayments,
  handleClickPaymentBankNote,
}: Props) {
  const rows = useMemo(() => getRows(payments), [payments]);
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
        dataField: "payment.amount",
        caption: "Total Repayment Amount",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.payment.amount} />
        ),
      },
      {
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
      {
        caption: "Bank Note",
        dataField: "bank_note",
        width: 340,
        cellRender: (params: ValueFormatterParams) =>
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
                  handleClickPaymentBankNote(params.row.data.repayment_id);
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
    [isCompanyVisible, handleClickCustomer, handleClickPaymentBankNote]
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
