import { ValueFormatterParams } from "@material-ui/data-grid";
import ArtifactLoansDataGrid from "components/Artifacts/ArtifactLoansDataGrid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { LoanFragment, Loans } from "generated/graphql";

interface Props {
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMiniTable?: boolean;
  isMultiSelectEnabled?: boolean;
  isViewNotesEnabled?: boolean;
  isExcelExport?: boolean;
  pager?: boolean;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

export default function InvoiceLoansDataGrid({
  isMaturityVisible = true,
  isMiniTable = false,
  isMultiSelectEnabled = false,
  isViewNotesEnabled = false,
  isExcelExport = false,
  pager = true,
  loans,
  actionItems,
  selectedLoanIds,
  handleSelectLoans,
}: Props) {
  return (
    <ArtifactLoansDataGrid
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
      artifactCaption="Invoice Number"
      artifactCellRenderer={(params: ValueFormatterParams) => (
        <InvoiceDrawerLauncher
          label={params.row.data.invoice?.invoice_id as string}
          invoiceId={params.row.data.invoice?.id as string}
        />
      )}
    />
  );
}
