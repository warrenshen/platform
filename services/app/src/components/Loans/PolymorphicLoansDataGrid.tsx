import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { LoanFragment, Loans, ProductTypeEnum } from "generated/graphql";

interface Props {
  productType: ProductTypeEnum | null;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  actionItems?: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function PolymorphicLoansDataGrid({
  productType,
  loans,
  selectedLoanIds = [],
  actionItems = [],
  handleSelectLoans = () => {},
}: Props) {
  if (productType === ProductTypeEnum.InventoryFinancing) {
    return (
      <PurchaseOrderLoansDataGrid
        loans={loans}
        selectedLoanIds={selectedLoanIds}
        actionItems={actionItems}
        handleSelectLoans={handleSelectLoans}
      />
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <LineOfCreditLoansDataGrid loans={loans} actionItems={actionItems} />
    );
  } else {
    return null;
  }
}

export default PolymorphicLoansDataGrid;
