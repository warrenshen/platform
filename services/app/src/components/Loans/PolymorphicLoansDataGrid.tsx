import InvoiceLoansDataGrid from "components/Invoices/InvoiceLoansDataGrid";
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrderLoansDataGrid";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { LoanFragment, Loans, ProductTypeEnum } from "generated/graphql";

interface Props {
  isMaturityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isViewNotesEnabled?: boolean;
  pager?: boolean;
  productType: ProductTypeEnum | null;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function PolymorphicLoansDataGrid({
  isMaturityVisible = true,
  isMultiSelectEnabled,
  isViewNotesEnabled,
  pager,
  productType,
  loans,
  actionItems,
  selectedLoanIds,
  handleSelectLoans,
}: Props) {
  if (
    productType === ProductTypeEnum.InventoryFinancing ||
    productType === ProductTypeEnum.PurchaseMoneyFinancing
  ) {
    return (
      <PurchaseOrderLoansDataGrid
        isMaturityVisible={isMaturityVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isViewNotesEnabled={isViewNotesEnabled}
        pager={pager}
        loans={loans}
        actionItems={actionItems}
        selectedLoanIds={selectedLoanIds}
        handleSelectLoans={handleSelectLoans}
      />
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <LineOfCreditLoansDataGrid
        isMaturityVisible={isMaturityVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isViewNotesEnabled={isViewNotesEnabled}
        pager={pager}
        loans={loans}
        actionItems={actionItems}
        selectedLoanIds={selectedLoanIds}
        handleSelectLoans={handleSelectLoans}
      />
    );
  } else if (productType === ProductTypeEnum.InvoiceFinancing) {
    return (
      <InvoiceLoansDataGrid
        isMaturityVisible={isMaturityVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isViewNotesEnabled={isViewNotesEnabled}
        pager={pager}
        loans={loans}
        actionItems={actionItems}
        selectedLoanIds={selectedLoanIds}
        handleSelectLoans={handleSelectLoans}
      />
    );
  } else {
    return null;
  }
}

export default PolymorphicLoansDataGrid;
