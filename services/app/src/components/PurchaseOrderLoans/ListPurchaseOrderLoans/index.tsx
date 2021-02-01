import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import Launcher from "components/Shared/PurchaseOrderLoanDrawer/Launcher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  Selection,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { Maybe, PurchaseOrderLoanFragment } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";
import Status from "components/Shared/Chip/Status";

function getRows(
  purchaseOrderLoans: Maybe<PurchaseOrderLoanFragment[]>
): RowsProp {
  return purchaseOrderLoans
    ? purchaseOrderLoans.map((item) => {
        return {
          ...item,
        };
      })
    : [];
}
interface Props {
  purchaseOrderLoans: PurchaseOrderLoanFragment[];
  handleApproveLoan: (loanId: string) => void;
  handleEditLoanNotes: (loanId: string) => void;
  handleEditPurchaseOrderLoan: (purchaseOrderLoanId: string) => void;
  handleRejectLoan: (loanId: string) => void;
}

function ListPurchaseOrderLoans({
  purchaseOrderLoans,
  handleApproveLoan,
  handleEditLoanNotes,
  handleEditPurchaseOrderLoan,
  handleRejectLoan,
}: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = getRows(purchaseOrderLoans);

  const purchaseOrderRenderer = (params: ValueFormatterParams) => {
    const purchaseOrderLoan = params.row.data;
    const purchaseOrderLoanId = purchaseOrderLoan.id as string;
    const purchaseOrderNumber = purchaseOrderLoan.purchase_order
      .order_number as string;
    return (
      <Box>
        <span>{purchaseOrderNumber}</span>
        <Launcher purchaseOrderLoanId={purchaseOrderLoanId}></Launcher>
      </Box>
    );
  };

  const statusCellRenderer = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const loanNotesRenderer = (params: ValueFormatterParams) => (
    <Box>{params.row.data.loan.notes as string}</Box>
  );

  const actionCellRenderer = (params: ValueFormatterParams) => (
    <ActionMenu
      actionItems={[
        ...(check(user.role, Action.EditPurchaseOrderLoan)
          ? [
              {
                key: "edit-purchase-order-loan",
                label: "Edit",
                handleClick: () =>
                  handleEditPurchaseOrderLoan(params.row.data.id as string),
              },
            ]
          : []),
        ...(check(user.role, Action.EditLoanInternalNote)
          ? [
              {
                key: "edit-loan-notes",
                label: "Edit Internal Note",
                handleClick: () =>
                  handleEditLoanNotes(params.row.data.loan_id as string),
              },
            ]
          : []),
        ...(check(user.role, Action.ApproveLoan)
          ? [
              {
                key: "approve-loan",
                label: "Approve Loan",
                handleClick: () =>
                  handleApproveLoan(params.row.data.loan_id as string),
              },
            ]
          : []),
        ...(check(user.role, Action.RejectLoan)
          ? [
              {
                key: "reject-loan",
                label: "Reject Loan",
                handleClick: () =>
                  handleRejectLoan(params.row.data.loan_id as string),
              },
            ]
          : []),
      ]}
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
    {
      dataField: "purchase_order_id",
      caption: "Purchase Order",
      cellRender: purchaseOrderRenderer,
      minWidth: 150,
    },
    {
      dataField: "loan.amount",
      alignment: "left",
      caption: "Amount",
      minWidth: 150,
    },
    {
      dataField: "loan.origination_date",
      caption: "Origination Date",
      alignment: "center",
      minWidth: 140,
    },
    {
      dataField: "loan.maturity_date",
      caption: "Maturity Date",
      alignment: "center",
      minWidth: 140,
    },
    {
      dataField: "loan.outstanding_principal_balance",
      caption: "Outstanding Principal Balance",
      minWidth: 220,
    },
    {
      dataField: "loan.status",
      caption: "Status",
      alignment: "center",
      minWidth: 175,
      cellRender: statusCellRenderer,
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      cellRender: actionCellRenderer,
    },
    {
      dataField: "loan.notes",
      caption: "Internal Note",
      minWidth: 300,
      visible: check(user.role, Action.ViewLoanInternalNote),
      cellRender: loanNotesRenderer,
    },
  ];

  const onSelectionChanged = (params: any) => {
    const { selectedRowsData } = params;
    console.log(selectedRowsData);
  };

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <DataGrid
        height={"100%"}
        width={"100%"}
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
              key={dataField}
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
    </div>
  );
}
export default ListPurchaseOrderLoans;
