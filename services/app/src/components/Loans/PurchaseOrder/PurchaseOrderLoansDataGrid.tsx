import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { LoanFragment, Loans, LoanStatusEnum } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { createLoanPublicIdentifier } from "lib/loans";
import React, { useContext } from "react";

interface Props {
  pager?: boolean;
  isMiniTable?: boolean;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  actionItems?: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function PurchaseOrderLoansDataGrid({
  pager = true,
  isMiniTable = false,
  loans,
  selectedLoanIds = [],
  actionItems = [],
  handleSelectLoans = () => {},
}: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = loans;

  const columns = [
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
      dataField: "status",
      caption: "Status",
      alignment: "center",
      minWidth: 175,
      cellRender: (params: ValueFormatterParams) => (
        <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
      ),
    },
    {
      visible: !isMiniTable,
      dataField: "artifact_id",
      caption: "Purchase Order",
      minWidth: 180,
      cellRender: (params: ValueFormatterParams) => (
        <PurchaseOrderDrawerLauncher
          label={params.row.data.purchase_order?.order_number as string}
          purchaseOrderId={params.row.data.purchase_order?.id as string}
        />
      ),
    },
    {
      alignment: "right",
      caption: "Amount",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      visible: !isMiniTable,
      caption: "Requested Payment Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.requested_payment_date} />
      ),
    },
    {
      caption: "Maturity Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.maturity_date} />
      ),
    },
    {
      visible: !isMiniTable,
      caption: "Outstanding Principal Balance",
      minWidth: 220,
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.outstanding_principal_balance}
        />
      ),
    },
    {
      visible: !isMiniTable,
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
    },
    {
      visible: !isMiniTable && check(user.role, Action.ViewLoanInternalNote),
      dataField: "notes",
      caption: "Internal Note",
      minWidth: 300,
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager={pager}
        pageSize={isMiniTable ? 10 : undefined}
        select={!isMiniTable}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedLoanIds}
        onSelectionChanged={({ selectedRowsData }: any) =>
          handleSelectLoans(selectedRowsData as LoanFragment[])
        }
      />
    </Box>
  );
}

export default PurchaseOrderLoansDataGrid;
