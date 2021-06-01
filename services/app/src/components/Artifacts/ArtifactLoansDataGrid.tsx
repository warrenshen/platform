import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  LoanArtifactLimitedFragment,
  LoanFragment,
  Loans,
  LoanStatusEnum,
} from "generated/graphql";
import { LoanPaymentStatusEnum } from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

export interface ArtifactLoansDataGridFlagProps {
  isApprovalStatusVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMiniTable?: boolean;
  isMultiSelectEnabled?: boolean;
  isOriginationDateVisible?: boolean; // Whether origination date is visible.
  isRequestedDateVisible?: boolean; // Whether requested payment date is visible.
  isViewNotesEnabled?: boolean;
  pager?: boolean;
}

interface ArtifactLoansDataGridArtifactProps {
  artifactCaption: string;
}

export interface ArtifactLoansDataGridLoansProps {
  loans: (LoanFragment & LoanArtifactLimitedFragment)[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function getRows(
  loans: (LoanFragment & LoanArtifactLimitedFragment)[]
): RowsProp {
  return loans.map((loan) => ({
    ...loan,
    customer_identifier: createLoanCustomerIdentifier(loan),
    disbursement_identifier: createLoanDisbursementIdentifier(loan),
    artifact_name: loan.purchase_order
      ? loan.purchase_order.order_number
      : loan.invoice
      ? loan.invoice.invoice_number
      : loan.line_of_credit?.is_credit_for_vendor
      ? loan.line_of_credit.recipient_vendor?.name
      : "N/A",
  }));
}

export default function ArtifactLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isViewNotesEnabled = false,
  pager = true,
  artifactCaption,
  loans,
  selectedLoanIds,
  handleSelectLoans,
}: ArtifactLoansDataGridFlagProps &
  ArtifactLoansDataGridArtifactProps &
  ArtifactLoansDataGridLoansProps) {
  const rows = useMemo(() => getRows(loans), [loans]);

  const columns = useMemo(
    () => [
      {
        dataField: "customer_identifier",
        caption: "Customer Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.customer_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: isDisbursementIdentifierVisible,
        dataField: "disbursement_identifier",
        caption: "Disbursement Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.disbursement_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: isApprovalStatusVisible,
        dataField: "status",
        caption: "Approval Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanStatusChip
            loanStatus={params.row.data.status as LoanStatusEnum}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "payment_status",
        caption: "Payment Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanPaymentStatusChip
            paymentStatus={params.value as LoanPaymentStatusEnum}
          />
        ),
      },
      {
        visible: !isMiniTable,
        dataField: "artifact_name",
        caption: artifactCaption,
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            {params.row.data.purchase_order && (
              <PurchaseOrderDrawerLauncher
                label={params.row.data.artifact_name as string}
                purchaseOrderId={params.row.data.purchase_order.id as string}
              />
            )}
            {params.row.data.invoice && (
              <InvoiceDrawerLauncher
                label={params.row.data.artifact_name as string}
                invoiceId={params.row.data.invoice.id as string}
              />
            )}
            {params.row.data.line_of_credit && "N/A"}
          </Box>
        ),
      },
      {
        caption: "Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: !isMiniTable && isRequestedDateVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: isOriginationDateVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.origination_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "adjusted_maturity_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.adjusted_maturity_date}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.outstanding_principal_balance}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_fees",
        caption: "Outstanding Late Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
        ),
      },
      {
        visible: !isMiniTable && isViewNotesEnabled,
        dataField: "notes",
        caption: "Internal Note",
        minWidth: 300,
      },
    ],
    [
      isApprovalStatusVisible,
      isDisbursementIdentifierVisible,
      isMaturityVisible,
      isMiniTable,
      isOriginationDateVisible,
      isRequestedDateVisible,
      isViewNotesEnabled,
      artifactCaption,
    ]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectLoans &&
      handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager={pager}
      pageSize={isMiniTable ? 10 : 10}
      select={isMultiSelectEnabled && !isMiniTable}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
