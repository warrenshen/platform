import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { LoanFragment, Loans, ProductTypeEnum } from "generated/graphql";

interface Props {
  isMaturityVisible?: boolean;
  productType: ProductTypeEnum | null;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  actionItems?: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
  isMultiSelectEnabled?: boolean;
  isViewNotesEnabled?: boolean;
}

function PolymorphicLoansDataGrid({
  isMaturityVisible = true,
  productType,
  loans,
  selectedLoanIds = [],
  actionItems = [],
  handleSelectLoans = () => {},
  isMultiSelectEnabled,
  isViewNotesEnabled,
}: Props) {
  if (productType === ProductTypeEnum.InventoryFinancing) {
    return (
      <PurchaseOrderLoansDataGrid
        isMaturityVisible={isMaturityVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isViewNotesEnabled={isViewNotesEnabled}
        loans={loans}
        selectedLoanIds={selectedLoanIds}
        actionItems={actionItems}
        handleSelectLoans={handleSelectLoans}
      />
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <LineOfCreditLoansDataGrid
        isMaturityVisible={isMaturityVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isViewNotesEnabled={isViewNotesEnabled}
        loans={loans}
        actionItems={actionItems}
      />
    );
  } else {
    return null;
  }
}

export default PolymorphicLoansDataGrid;
