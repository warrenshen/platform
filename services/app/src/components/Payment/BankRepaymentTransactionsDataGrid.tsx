import { Box, Button, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import InvoiceDrawer from "components/Invoices/InvoiceDrawer";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import BankPurchaseOrderDrawer from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import PurchaseOrderIdentifierDataGridCell from "components/Shared/DataGrid/PurchaseOrderIdentifierDataGridCell";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  GetRepaymentsSubscription,
  Invoices,
  LoanLimitedFragment,
  PaymentLimitedFragment,
  Payments,
  PurchaseOrders,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
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
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { flatten, sumBy } from "lodash";
import { useContext, useMemo, useState } from "react";

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
              payment_deposit_date: !!payment?.deposit_date
                ? parseDateStringServer(payment.deposit_date)
                : null,
              payment_settlement_date: !!payment?.settlement_date
                ? parseDateStringServer(payment.settlement_date)
                : null,
              status: "Reversed",
            }),
          ]
        : payment.transactions.map((transaction) =>
            formatRowModel({
              adjusted_maturity_date: !!transaction.loan?.adjusted_maturity_date
                ? parseDateStringServer(transaction.loan.adjusted_maturity_date)
                : null,
              bank_note: payment.bank_note,
              company_id: payment.company_id,
              company_identifier: payment.company.identifier,
              company_name: payment.company.name,
              id: `${payment.id}-${transaction.id}`,
              payment: payment,
              payment_deposit_date: !!payment?.deposit_date
                ? parseDateStringServer(payment.deposit_date)
                : null,
              payment_settlement_date: !!payment?.settlement_date
                ? parseDateStringServer(payment.settlement_date)
                : null,
              repayment_id: payment.id,
              status: "Settled",
              to_account_fees:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? payment.items_covered?.requested_to_account_fees
                    ? payment.items_covered.requested_to_account_fees
                    : 0
                  : transaction?.type === PaymentTypeEnum.RepaymentOfAccountFee
                  ? transaction.amount
                  : 0,
              to_interest_sum:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? payment.transactions?.length
                    ? sumBy(payment.transactions, "to_interest")
                    : null
                  : transaction?.to_interest != null
                  ? transaction.to_interest
                  : null,
              to_late_fees:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? 0
                  : transaction?.to_fees != null
                  ? transaction.to_fees
                  : null,
              to_principal_sum:
                !!productType && productType === ProductTypeEnum.LineOfCredit
                  ? payment.transactions?.length
                    ? sumBy(payment.transactions, "to_principal")
                    : null
                  : transaction?.to_principal != null
                  ? transaction.to_principal
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
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] =
    useState<PurchaseOrders["id"]>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<Invoices["id"]>(null);
  const rows = useMemo(() => getRows(payments), [payments]);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "payment.settlement_identifier",
        caption: "Repayment #",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
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
        cellRender: (params: GridValueFormatterParams) =>
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
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "payment_deposit_date",
        caption: "Deposit Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "payment_settlement_date",
        caption: "Settlement Date",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "transaction.loan.disbursement_identifier",
        caption: "Loan Disbursement Identifier",
        width: ColumnWidths.Identifier,
        cellRender: (params: GridValueFormatterParams) => (
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
        cellRender: (params: GridValueFormatterParams) =>
          params.row.data.transaction?.loan?.purchase_order ? (
            <PurchaseOrderIdentifierDataGridCell
              onClick={() => {
                setSelectedPurchaseOrderId(
                  params.row.data.transaction.loan.artifact_id
                );
              }}
              artifactName={params.row.data.transaction.loan.artifact_name}
              isMetrcBased={
                params.row.data.transaction.loan.purchase_order.is_metrc_based
              }
            />
          ) : params.row.data.transaction?.loan?.invoice ? (
            <ClickableDataGridCell
              onClick={() => {
                setSelectedInvoiceId(
                  params.row.data.transaction.loan.artifact_id
                );
              }}
              label={params.row.data.transaction.loan.artifact_name}
            />
          ) : params.row.data.line_of_credit ? (
            "N/A"
          ) : null,
      },
      {
        dataField: "payment.amount",
        caption: "Total Repayment Amount",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        minWidth: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "transaction.amount",
        caption: "Transaction Total Amount",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "to_principal_sum",
        caption: "Applied to Principal",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "to_interest_sum",
        caption: "Applied to Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "to_late_fees",
        caption: "Applied to Late Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "to_account_fees",
        caption: "Applied to Account Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
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
    <Box>
      {!!selectedPurchaseOrderId && (
        <BankPurchaseOrderDrawer
          purchaseOrderId={selectedPurchaseOrderId}
          isBankUser={isBankUser}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      {!!selectedInvoiceId && (
        <InvoiceDrawer
          invoiceId={selectedInvoiceId}
          handleClose={() => setSelectedInvoiceId(null)}
        />
      )}
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
    </Box>
  );
}
