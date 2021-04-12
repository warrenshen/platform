import { ValueFormatterParams } from "@material-ui/data-grid";
import ArtifactLoansDataGrid from "components/Artifacts/ArtifactLoansDataGrid";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { LoanFragment, Loans } from "generated/graphql";

interface Props {
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMiniTable?: boolean;
  isMultiSelectEnabled?: boolean;
  isViewNotesEnabled?: boolean;
  pager?: boolean;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

export default function PurchaseOrderLoansDataGrid({
  isDisbursementIdentifierVisible = false,
  isExcelExport = false,
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isViewNotesEnabled = false,
  pager = true,
  loans,
  actionItems,
  selectedLoanIds,
  handleSelectLoans,
}: Props) {
  return (
    <ArtifactLoansDataGrid
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isMaturityVisible={isMaturityVisible}
      isMiniTable={isMiniTable}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isViewNotesEnabled={isViewNotesEnabled}
      isExcelExport={isExcelExport}
      pager={pager}
      loans={loans}
      actionItems={actionItems}
      selectedLoanIds={selectedLoanIds}
      handleSelectLoans={handleSelectLoans}
      artifactCaption="Purchase Order"
      artifactCellRenderer={(params: ValueFormatterParams) => (
        <PurchaseOrderDrawerLauncher
          label={params.row.data.purchase_order?.order_number as string}
          purchaseOrderId={params.row.data.purchase_order?.id as string}
        />
      )}
    />
  );
}
