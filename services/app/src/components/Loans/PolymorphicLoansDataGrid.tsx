import {
  ArtifactLoansDataGridFlagProps,
  ArtifactLoansDataGridLoansProps,
} from "components/Artifacts/ArtifactLoansDataGrid";
import InvoiceLoansDataGrid from "components/Invoices/InvoiceLoansDataGrid";
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrderLoansDataGrid";
import { ProductTypeEnum } from "generated/graphql";

interface Props {
  productType: ProductTypeEnum | null;
}

function PolymorphicLoansDataGrid({
  isApprovalStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = false,
  isMaturityVisible = true,
  isMultiSelectEnabled,
  isOriginationDateVisible = true,
  isRequestedDateVisible = false,
  isViewNotesEnabled,
  pager,
  productType,
  loans,
  selectedLoanIds,
  handleSelectLoans,
}: ArtifactLoansDataGridFlagProps & ArtifactLoansDataGridLoansProps & Props) {
  if (
    productType === ProductTypeEnum.InventoryFinancing ||
    productType === ProductTypeEnum.PurchaseMoneyFinancing
  ) {
    return (
      <PurchaseOrderLoansDataGrid
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
      />
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <LineOfCreditLoansDataGrid
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
      />
    );
  } else if (productType === ProductTypeEnum.InvoiceFinancing) {
    return (
      <InvoiceLoansDataGrid
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
      />
    );
  } else {
    return null;
  }
}

export default PolymorphicLoansDataGrid;
