import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import PurchaseOrderDrawerLauncher from "components/Shared/PurchaseOrder/PurchaseOrderDrawerLauncher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
  Selection,
} from "devextreme-react/data-grid";
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

  const columns: IColumnProps[] = [
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
      <DataGrid
        height={"100%"}
        onSelectionChanged={onSelectionChanged}
        wordWrapEnabled={true}
        dataSource={rows}
      >
        {columns.map(
          ({
            dataField,
            minWidth,
            alignment,
            visible,
            caption,
            cellRender,
          }) => (
            <Column
              key={caption}
              caption={caption}
              visible={visible}
              dataField={dataField}
              minWidth={minWidth}
              alignment={alignment}
              cellRender={cellRender}
            />
          )
        )}
        <Selection
          mode="multiple"
          selectAllMode={"allPages"}
          showCheckBoxesMode={"always"}
        />
        <Paging defaultPageSize={50} />
        <Pager
          visible={true}
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 50]}
          showInfo={true}
        />
      </DataGrid>
    </Box>
  );
}

export default PurchaseOrderLoansDataGrid;
