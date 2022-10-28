import ArtifactLoansDataGrid, {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";

function LineOfCreditLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isFilteringEnabled,
  isMaturityVisible = true,
  isMultiSelectEnabled,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isViewNotesEnabled,
  pager = true,
  loans,
  selectedLoanIds,
  handleSelectLoans,
}: ArtifactLoansDataGridFlagProps & ArtifactLoansDataGridLoansProps) {
  return (
    <ArtifactLoansDataGrid
      artifactCaption={"Recipient Vendor"}
      handleSelectLoans={handleSelectLoans}
      isApprovalStatusVisible={isApprovalStatusVisible}
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isExcelExport={isExcelExport}
      isFilteringEnabled={isFilteringEnabled}
      isMaturityVisible={isMaturityVisible}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isOriginationDateVisible={isOriginationDateVisible}
      isRequestedDateVisible={isRequestedDateVisible}
      isViewNotesEnabled={isViewNotesEnabled}
      loans={loans}
      pager={pager}
      selectedLoanIds={selectedLoanIds}
    />
  );
}

export default LineOfCreditLoansDataGrid;
