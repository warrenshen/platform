import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { LoanFragment, LoanStatusEnum } from "generated/graphql";
import { createLoanPublicIdentifier } from "lib/loans";
import { useEffect, useState } from "react";

interface Props {
  isSortingDisabled?: boolean;
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isStatusVisible?: boolean;
  customerSearchQuery?: string;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
}

// TODO (warrenshen): merge this component with the other LoansDataGrid
// component to create a reusable component?
function LoansDataGrid({
  isSortingDisabled = false,
  isMaturityVisible = true,
  isStatusVisible = true,
  customerSearchQuery = "",
  loans,
  actionItems = [],
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = loans;

  useEffect(() => {
    if (!dataGrid) return;
    if (customerSearchQuery) {
      dataGrid.instance.filter([
        "purchase_order.company.name",
        "contains",
        customerSearchQuery,
      ]);
    } else {
      dataGrid.instance.clearFilter();
    }
  }, [dataGrid, customerSearchQuery]);

  const columns = [
    {
      dataField: "id",
      caption: "ID",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <LoanDrawerLauncher
          label={createLoanPublicIdentifier(params.row.data as LoanFragment)}
          loanId={params.row.data.id as string}
        />
      ),
    },
    {
      visible: actionItems.length > 0,
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 75,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
    },
    {
      visible: isStatusVisible,
      dataField: "status",
      caption: "Status",
      width: 120,
      alignment: "center",
      cellRender: (params: ValueFormatterParams) => (
        <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
      ),
    },
    {
      visible: isMaturityVisible,
      caption: "Maturity Date",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.maturity_date} />
      ),
    },
    {
      caption: "Loan Amount",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      visible: isMaturityVisible,
      dataField: "outstanding_principal_balance",
      caption: "Outstanding Principal",
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
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
      ),
    },
    {
      visible: isMaturityVisible,
      dataField: "outstanding_fees",
      caption: "Outstanding Fees",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
      ),
    },
  ];

  return (
    <ControlledDataGrid
      isSortingDisabled={isSortingDisabled}
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
    />
  );
}

export default LoansDataGrid;
