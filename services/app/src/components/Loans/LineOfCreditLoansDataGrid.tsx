import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
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
import { createLoanIdentifier } from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMultiSelectEnabled?: boolean;
  isViewNotesEnabled?: boolean;
  isExcelExport?: boolean;
  pager?: boolean;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function LineOfCreditLoansDataGrid({
  isMaturityVisible = true,
  isMultiSelectEnabled,
  isViewNotesEnabled,
  isExcelExport = false,
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
            label={createLoanIdentifier(params.row.data as LoanFragment)}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        width: ColumnWidths.Status,
        alignment: "center",
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
        caption: "Recipient Vendor",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: (data: any) =>
          data?.line_of_credit?.is_credit_for_vendor
            ? data.line_of_credit.recipient_vendor?.name
            : "N/A",
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {params.row.data?.line_of_credit?.is_credit_for_vendor
              ? params.row.data.line_of_credit.recipient_vendor?.name
              : "N/A"}
          </Box>
        ),
      },
      {
        caption: "Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: !isMaturityVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: isViewNotesEnabled,
        dataField: "notes",
        caption: "Internal Note",
        minWidth: 300,
      },
      {
        visible: isMaturityVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.origination_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "maturity_date",
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
    [isMaturityVisible, isViewNotesEnabled, actionItems]
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
        select={isMultiSelectEnabled}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedLoanIds}
        onSelectionChanged={handleSelectionChanged}
        isExcelExport={isExcelExport}
      />
    </Box>
  );
}

export default LineOfCreditLoansDataGrid;
