import ArtifactLoansDataGrid, {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";

export default function PurchaseOrderLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
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
      isApprovalStatusVisible={isApprovalStatusVisible}
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isMaturityVisible={isMaturityVisible}
      isMiniTable={isMiniTable}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isOriginationDateVisible={isOriginationDateVisible}
      isRequestedDateVisible={isRequestedDateVisible}
      isViewNotesEnabled={isViewNotesEnabled}
      isDaysPastDueVisible={isDaysPastDueVisible}
      isVendorVisible={isVendorVisible}
      isExcelExport={isExcelExport}
      pager={pager}
      loans={loans}
      selectedLoanIds={selectedLoanIds}
      handleSelectLoans={handleSelectLoans}
      artifactCaption={"Purchase Order"}
    />
  );
}
