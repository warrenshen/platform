import ArtifactLoansDataGrid, {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";

export default function InvoiceLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isRequestingUserVisible = true,
  isViewNotesEnabled = false,
  pager = true,
  loans,
  selectedLoanIds,
  isFilteringEnabled,
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
      isRequestingUserVisible={isRequestingUserVisible}
      isViewNotesEnabled={isViewNotesEnabled}
      pager={pager}
      loans={loans}
      selectedLoanIds={selectedLoanIds}
      handleSelectLoans={handleSelectLoans}
      artifactCaption={"Invoice Number"}
      isFilteringEnabled={isFilteringEnabled}
    />
  );
}
