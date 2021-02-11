import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid";
import Status from "components/Shared/Chip/Status";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import PurchaseOrderDrawerLauncher from "components/Shared/PurchaseOrder/PurchaseOrderDrawerLauncher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { LoanFragment } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";

interface Props {
  purchaseOrderLoans: LoanFragment[];
  actionItems: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function PurchaseOrderLoansDataGrid({
  purchaseOrderLoans,
  actionItems,
  handleSelectLoans = () => {},
}: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = purchaseOrderLoans;

  const columns = [
    {
      dataField: "artifact_id",
      caption: "Purchase Order",
      minWidth: 180,
      cellRender: (params: ValueFormatterParams) => (
        <PurchaseOrderDrawerLauncher
          label={params.row.data.purchase_order.order_number as string}
          purchaseOrderId={params.row.data.purchase_order.id as string}
        ></PurchaseOrderDrawerLauncher>
      ),
    },
    {
      alignment: "right",
      caption: "Amount",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.amount}
        ></CurrencyDataGridCell>
      ),
    },
    {
      caption: "Payment Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.origination_date}
        ></DateDataGridCell>
      ),
    },
    {
      caption: "Maturity Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.maturity_date}
        ></DateDataGridCell>
      ),
    },
    {
      caption: "Outstanding Principal Balance",
      minWidth: 220,
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.outstanding_principal_balance}
        ></CurrencyDataGridCell>
      ),
    },
    {
      dataField: "status",
      caption: "Status",
      alignment: "center",
      minWidth: 175,
      cellRender: (params: ValueFormatterParams) => (
        <Status statusValue={params.value} />
      ),
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu
          params={params}
          actionItems={actionItems}
        ></DataGridActionMenu>
      ),
    },
    {
      dataField: "notes",
      caption: "Internal Note",
      minWidth: 300,
      visible: check(user.role, Action.ViewLoanInternalNote),
    },
  ];

  const onSelectionChanged = (params: any) => {
    const { selectedRowsData } = params;
    handleSelectLoans(selectedRowsData as LoanFragment[]);
  };

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        dataSource={rows}
        columns={columns}
        onSelectionChanged={onSelectionChanged}
        selectedRowKeys={[]}
        pager
        select
      ></ControlledDataGrid>
    </Box>
  );
}

export default PurchaseOrderLoansDataGrid;
