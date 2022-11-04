import { GridValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  LoanArtifactLimitedFragment,
  LoanFragment,
  Loans,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  LoanPaymentStatusEnum,
  LoanPaymentStatusToLabel,
  LoanStatusEnum,
} from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getDaysPastDue,
  getLoanArtifactName,
} from "lib/loans";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

export interface ArtifactLoansDataGridFlagProps {
  isApprovalStatusVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMiniTable?: boolean;
  isMultiSelectEnabled?: boolean;
  isOriginationDateVisible?: boolean; // Whether origination date is visible.
  isRequestedDateVisible?: boolean; // Whether requested payment date is visible.
  isRequestingUserVisible?: boolean; // Whether requesting user is visible.
  isViewNotesEnabled?: boolean;
  isDaysPastDueVisible?: boolean;
  isVendorVisible?: boolean;
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

function getRows(loans: (LoanFragment & LoanArtifactLimitedFragment)[]) {
  return loans.map((loan) => {
    return formatRowModel({
      ...loan,
      adjusted_maturity_date: !!loan?.adjusted_maturity_date
        ? parseDateStringServer(loan.adjusted_maturity_date)
        : null,
      artifact_name: getLoanArtifactName(loan),
      customer_identifier: createLoanCustomerIdentifier(loan),
      days_past_due: getDaysPastDue(loan),
      disbursement_identifier: createLoanDisbursementIdentifier(loan),
      origination_date: !!loan?.origination_date
        ? parseDateStringServer(loan.origination_date)
        : null,
      requested_payment_date: !!loan?.requested_payment_date
        ? parseDateStringServer(loan.requested_payment_date)
        : null,
      requesting_user: !!loan?.requested_by_user?.full_name
        ? loan.requested_by_user.full_name
        : null,
      vendor_name: !!loan?.purchase_order?.vendor?.name
        ? loan.purchase_order.vendor.name
        : null,
    });
  });
}

export default function ArtifactLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isRequestingUserVisible = true,
  isViewNotesEnabled = false,
  isDaysPastDueVisible = false,
  isVendorVisible = false,
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
        fixed: true,
        dataField: "customer_identifier",
        caption: "Customer Identifier",
        width: ColumnWidths.LongIdentifier,
        cellRender: (params: GridValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.customer_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        fixed: true,
        visible: isDisbursementIdentifierVisible,
        dataField: "disbursement_identifier",
        caption: "Disbursement Identifier",
        width: ColumnWidths.LongIdentifier,
        cellRender: (params: GridValueFormatterParams) => (
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
        cellRender: (params: GridValueFormatterParams) => (
          <LoanStatusChip
            loanStatus={params.row.data.status as LoanStatusEnum}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "payment_status",
        caption: "Repayment Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <LoanPaymentStatusChip
            paymentStatus={params.value as LoanPaymentStatusEnum}
          />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(LoanPaymentStatusEnum).map(
                (loanPaymentStatus) => ({
                  loan_payment_status: loanPaymentStatus,
                  label: LoanPaymentStatusToLabel[loanPaymentStatus],
                })
              ),
              key: "loan_payment_status",
            },
          },
          valueExpr: "loan_payment_status",
          displayExpr: "label",
        },
      },
      {
        visible: isRequestingUserVisible,
        dataField: "requesting_user",
        caption: "Requesting User",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
      {
        visible: !isMiniTable && isRequestedDateVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isVendorVisible,
        caption: "Vendor Name",
        dataField: "vendor_name",
        width: ColumnWidths.MinWidth,
        alignment: "right",
      },
      {
        visible: !isMiniTable,
        dataField: "artifact_name",
        caption: artifactCaption,
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) =>
          params.row.data.purchase_order ? (
            <PurchaseOrderDrawerLauncher
              label={params.row.data.artifact_name}
              isMetrcBased={params.row.data.purchase_order.is_metrc_based}
              purchaseOrderId={params.row.data.purchase_order.id}
            />
          ) : params.row.data.invoice ? (
            <InvoiceDrawerLauncher
              label={params.row.data.artifact_name}
              invoiceId={params.row.data.invoice.id}
            />
          ) : params.row.data.line_of_credit ? (
            params.row.data.artifact_name
          ) : null,
      },
      {
        visible: isOriginationDateVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "adjusted_maturity_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isMaturityVisible && isDaysPastDueVisible,
        dataField: "days_past_due",
        caption: "Days Past Due",
        width: 100,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal Balance",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_fees",
        caption: "Outstanding Late Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: false && isViewNotesEnabled,
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
      isRequestingUserVisible,
      isVendorVisible,
      isViewNotesEnabled,
      isDaysPastDueVisible,
      artifactCaption,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectLoans &&
        handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={rows}
      filtering={{ enable: isFilteringEnabled }}
      isExcelExport={isExcelExport}
      onSelectionChanged={handleSelectionChanged}
      pager={pager}
      pageSize={isMiniTable ? 10 : 10}
      select={isMultiSelectEnabled && !isMiniTable}
      selectedRowKeys={selectedLoanIds}
    />
  );
}
