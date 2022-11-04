import ArtifactLoansDataGrid, {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";

export default function PurchaseOrderLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isFilteringEnabled,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isRequestingUserVisible = true,
  isViewNotesEnabled = false,
  isDaysPastDueVisible = false,
  isVendorVisible = true,
  pager = true,
  loans,
  selectedLoanIds,
  handleSelectLoans,
}: ArtifactLoansDataGridFlagProps & ArtifactLoansDataGridLoansProps) {
  return (
    <ArtifactLoansDataGrid
      artifactCaption={"Purchase Order"}
      handleSelectLoans={handleSelectLoans}
      isApprovalStatusVisible={isApprovalStatusVisible}
      isDaysPastDueVisible={isDaysPastDueVisible}
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isExcelExport={isExcelExport}
      isFilteringEnabled={isFilteringEnabled}
      isMaturityVisible={isMaturityVisible}
      isMiniTable={isMiniTable}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isOriginationDateVisible={isOriginationDateVisible}
      isRequestedDateVisible={isRequestedDateVisible}
      isRequestingUserVisible={isRequestingUserVisible}
      isViewNotesEnabled={isViewNotesEnabled}
      isVendorVisible={isVendorVisible}
      loans={loans}
      pager={pager}
      selectedLoanIds={selectedLoanIds}
    />
  );
}
