import ArtifactLoansDataGrid, {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";

function LineOfCreditLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = false,
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
      isApprovalStatusVisible={isApprovalStatusVisible}
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isExcelExport={isExcelExport}
      isMaturityVisible={isMaturityVisible}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isOriginationDateVisible={isOriginationDateVisible}
      isRequestedDateVisible={isRequestedDateVisible}
      isViewNotesEnabled={isViewNotesEnabled}
      pager={pager}
      loans={loans}
      selectedLoanIds={selectedLoanIds}
      handleSelectLoans={handleSelectLoans}
      artifactCaption={"Recipient Vendor"}
    />
  );
}

export default LineOfCreditLoansDataGrid;
