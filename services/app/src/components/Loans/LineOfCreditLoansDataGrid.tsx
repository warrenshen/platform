import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ArtifactLoansDataGrid from "components/Artifacts/ArtifactLoansDataGrid";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { LoanFragment, Loans } from "generated/graphql";

interface Props {
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMultiSelectEnabled?: boolean;
  isViewNotesEnabled?: boolean;
  pager?: boolean;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function LineOfCreditLoansDataGrid({
  isDisbursementIdentifierVisible = false,
  isExcelExport = false,
  isMaturityVisible = true,
  isMultiSelectEnabled,
  isViewNotesEnabled,
  pager = true,
  loans,
  actionItems,
  selectedLoanIds,
  handleSelectLoans,
}: Props) {
  return (
    <ArtifactLoansDataGrid
      isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
      isExcelExport={isExcelExport}
      isMaturityVisible={isMaturityVisible}
      isMultiSelectEnabled={isMultiSelectEnabled}
      isViewNotesEnabled={isViewNotesEnabled}
      pager={pager}
      loans={loans}
      actionItems={actionItems}
      selectedLoanIds={selectedLoanIds}
      handleSelectLoans={handleSelectLoans}
      artifactCaption={"Recipient Vendor"}
      artifactCellRenderer={(params: ValueFormatterParams) => (
        <Box>
          {params.row.data?.line_of_credit?.is_credit_for_vendor
            ? params.row.data.line_of_credit.recipient_vendor?.name
            : "N/A"}
        </Box>
      )}
    />
  );
}

export default LineOfCreditLoansDataGrid;
