import { ValueFormatterParams } from "@material-ui/data-grid";
import ArtifactLoansDataGrid, {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";

export default function InvoiceLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = false,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isViewNotesEnabled = false,
  pager = true,
  loans,
  selectedLoanIds,
  handleSelectLoans,
}: ArtifactLoansDataGridFlagProps & ArtifactLoansDataGridLoansProps) {
  return (
    <ArtifactLoansDataGrid
      isApprovalStatusVisible={isApprovalStatusVisible}
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isExcelExport={isExcelExport}
      isMaturityVisible={isMaturityVisible}
      isMiniTable={isMiniTable}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isOriginationDateVisible={isOriginationDateVisible}
      isRequestedDateVisible={isRequestedDateVisible}
      isViewNotesEnabled={isViewNotesEnabled}
      pager={pager}
      loans={loans}
      selectedLoanIds={selectedLoanIds}
      handleSelectLoans={handleSelectLoans}
      artifactCaption="Invoice Number"
      artifactCellRenderer={(params: ValueFormatterParams) => (
        <InvoiceDrawerLauncher
          label={params.row.data.invoice?.invoice_number as string}
          invoiceId={params.row.data.invoice?.id as string}
        />
      )}
    />
  );
}
