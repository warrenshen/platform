import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import PaymentStatusChip from "components/Shared/Chip/PaymentStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { LoanFragment, Loans, LoanStatusEnum } from "generated/graphql";
import { PaymentStatusEnum } from "lib/enum";
import { createLoanPublicIdentifier } from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
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

function PurchaseOrderLoansDataGrid({
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
  const rows = loans;
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={createLoanPublicIdentifier(params.row.data as LoanFragment)}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: !isMiniTable && !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        minWidth: 100,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        visible: !isMaturityVisible,
        dataField: "status",
        caption: "Approval Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "payment_status",
        caption: "Payment Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <PaymentStatusChip
            paymentStatus={params.value as PaymentStatusEnum}
          />
        ),
      },
      {
        visible: !isMiniTable,
        dataField: "artifact_id",
        caption: "Purchase Order",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <PurchaseOrderDrawerLauncher
            label={params.row.data.purchase_order?.order_number as string}
            purchaseOrderId={params.row.data.purchase_order?.id as string}
          />
        ),
      },
      {
        caption: "Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: !isMiniTable && !isMaturityVisible,
        caption: "Requested Payment Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: !isMiniTable && isViewNotesEnabled,
        dataField: "notes",
        caption: "Internal Note",
        minWidth: 300,
      },
      {
        visible: isMaturityVisible,
        caption: "Origination Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.origination_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.maturity_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.outstanding_principal_balance}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_fees",
        caption: "Outstanding Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
        ),
      },
    ],
    [isMaturityVisible, isMiniTable, isViewNotesEnabled, actionItems]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectLoans &&
      handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager={pager}
        pageSize={isMiniTable ? 10 : 10}
        select={isMultiSelectEnabled && !isMiniTable}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedLoanIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </Box>
  );
}

export default PurchaseOrderLoansDataGrid;
