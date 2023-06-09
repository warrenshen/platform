import { Box } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawer from "components/Invoices/InvoiceDrawer";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PaymentDrawer from "components/Payment/PaymentDrawer";
import BankPurchaseOrderDrawer from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import PurchaseOrderIdentifierDataGridCell from "components/Shared/DataGrid/PurchaseOrderIdentifierDataGridCell";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  GetRepaymentsForCompanyQuery,
  Invoices,
  LoanLimitedFragment,
  PaymentLimitedFragment,
  Payments,
  PurchaseOrders,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  PaymentTypeEnum,
  PlatformModeEnum,
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

function getRows(
  isLineOfCredit: boolean,
  payments: NonNullable<
    GetRepaymentsForCompanyQuery["companies_by_pk"]
  >["payments"]
) {
  if (isLineOfCredit) {
    const filteredReverseRepayments = payments.filter((payment) => {
      return !!payment?.reversed_at;
    });
    const reverseRepayments = filteredReverseRepayments.map((repayment) => {
      return {
        ...repayment,
        amount: repayment.amount * -1,
      };
    });
    const paymentsCopy = payments.map((repayment) => {
      return {
        ...repayment,
        amount: repayment.amount,
      };
    });
    const allPayments = paymentsCopy.concat(reverseRepayments);
    return allPayments.map((payment) => {
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
        repayment_id: payment.id,
        payment: payment,
        payment_deposit_date: !!payment?.deposit_date
          ? parseDateStringServer(payment.deposit_date)
          : null,
        payment_settlement_date: !!payment?.settlement_date
          ? parseDateStringServer(payment.settlement_date)
          : null,
        status:
          !!payment.reversed_at && payment.amount < 0 ? "Reversed" : "Settled",
        to_account_fees: payment.items_covered?.requested_to_account_fees
          ? payment.items_covered.requested_to_account_fees
          : 0,
        to_interest_sum: payment.transactions?.length
          ? sumBy(payment.transactions, "to_interest")
          : null,
        to_principal_sum: payment.transactions?.length
          ? sumBy(payment.transactions, "to_principal")
          : null,
      });
    });
  } else {
    const filteredReverseRepayments = payments.filter((payment) => {
      return !!payment?.reversed_at;
    });
    const reverseRepayments = filteredReverseRepayments.map((repayment) => {
      return {
        ...repayment,
        amount: repayment.amount * -1,
      };
    });
    const paymentsCopy = payments.map((repayment) => {
      return {
        ...repayment,
        amount: repayment.amount,
      };
    });

    const allPayments = paymentsCopy.concat(reverseRepayments).sort((a, b) => {
      if (Number(a.settlement_identifier) === Number(b.settlement_identifier)) {
        return Number(a.amount) - Number(b.amount);
      } else {
        return (
          Number(a.settlement_identifier) - Number(b.settlement_identifier)
        );
      }
    });
    return flatten(
      allPayments.map((payment) =>
        !!payment.reversed_at && payment.amount < 0
          ? [
              formatRowModel({
                company_id: payment.company_id,
                company_identifier: payment.company.identifier,
                company_name: payment.company.name,
                id: `${payment.id}-0`,
                repayment_id: payment.id,
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
                payment_deposit_date: !!payment?.deposit_date
                  ? parseDateStringServer(payment.deposit_date)
                  : null,
                payment_settlement_date: !!payment?.settlement_date
                  ? parseDateStringServer(payment.settlement_date)
                  : null,
                repayment_id: payment.id,
                status: "Settled",
                to_account_fees:
                  transaction?.type === PaymentTypeEnum.RepaymentOfAccountFee
                    ? transaction.amount
                    : 0,
                to_interest_sum:
                  transaction?.to_interest != null
                    ? transaction.to_interest
                    : null,
                to_late_fees:
                  transaction?.to_fees != null ? transaction.to_fees : null,
                to_principal_sum:
                  transaction?.to_principal != null
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
  isFilteringEnabled = true,
  isLineOfCredit = false,
  isMultiSelectEnabled = false,
  payments,
  selectedPaymentIds,
  handleClickCustomer = () => {},
  handleSelectPayments,
  handleClickPaymentBankNote,
}: Props) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const [selectedRepaymentId, setSelectedRepaymentId] = useState();
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] =
    useState<PurchaseOrders["id"]>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<Invoices["id"]>(null);

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
        calculateSortValue: (rowData: any) => {
          return Number(rowData.payment.settlement_identifier);
        },
        defaultSortIndex: 0,
        defaultSortOrder: "desc",
        cellRender: (params: GridValueFormatterParams) => (
          <ClickableDataGridCell
            label={
              isCompanyVisible
                ? `${params.row.data.company_identifier}-R${params.row.data.payment.settlement_identifier}`
                : `R${params.row.data.payment.settlement_identifier}`
            }
            onClick={() => {
              setSelectedRepaymentId(params.row.data.repayment_id);
            }}
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
        calculateSortValue: (rowData: any) => {
          return rowData.status;
        },
        defaultSortIndex: 1,
        defaultSortOrder: "asc",
      },
      {
        // This is meant to enforce consistent ordering
        // It should *NEVER* be visible
        visible: false,
        dataField: "created_at",
        caption: "Created At",
        width: ColumnWidths.Status,
        calculateSortValue: (rowData: any) => {
          return rowData.created_at;
        },
        defaultSortIndex: 2,
        defaultSortOrder: "asc",
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
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: !isLineOfCredit,
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
        visible: !isLineOfCredit,
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
        visible: !isLineOfCredit,
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
        visible: !isLineOfCredit,
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
    <>
      {!!selectedRepaymentId && (
        <PaymentDrawer
          paymentId={selectedRepaymentId}
          handleClose={() => setSelectedRepaymentId(undefined)}
          showBankInfo={isBankUser}
        />
      )}
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
    </>
  );
}
