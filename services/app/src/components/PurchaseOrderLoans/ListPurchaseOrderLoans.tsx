import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import Launcher from "components/Shared/PurchaseOrderLoanDrawer/Launcher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
  Selection,
} from "devextreme-react/data-grid";
import { LoanFragment, Maybe, Scalars } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";

function getRows(purchaseOrderLoans: Maybe<LoanFragment[]>): RowsProp {
  return purchaseOrderLoans
    ? purchaseOrderLoans.map((item) => {
        return {
          ...item,
        };
      })
    : [];
}
interface Props {
  purchaseOrderLoans: LoanFragment[];
  handleApproveLoan: (loanId: Scalars["uuid"]) => void;
  handleEditLoanNotes: (loanId: Scalars["uuid"]) => void;
  handleEditPurchaseOrderLoan: (purchaseOrderLoanId: Scalars["uuid"]) => void;
  handleViewLoan: (loanId: Scalars["uuid"]) => void;
  handleRejectLoan: (loanId: Scalars["uuid"]) => void;
}

function ListPurchaseOrderLoans({
  purchaseOrderLoans,
  handleApproveLoan,
  handleEditLoanNotes,
  handleEditPurchaseOrderLoan,
  handleViewLoan,
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
    <Box>{params.row.data.notes as string}</Box>
  );

  const actionCellRenderer = (params: ValueFormatterParams) => (
    <ActionMenu
      actionItems={[
        {
          key: "view-loan",
          label: "View",
          handleClick: () => handleViewLoan(params.row.data.id as string),
        },
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
      dataField: "artifact_id",
      caption: "Purchase Order",
      cellRender: purchaseOrderRenderer,
      minWidth: 150,
    },
    {
      dataField: "amount",
      alignment: "left",
      caption: "Amount",
      minWidth: 150,
    },
    {
      dataField: "origination_date",
      caption: "Origination Date",
      alignment: "center",
      minWidth: 140,
    },
    {
      dataField: "maturity_date",
      caption: "Maturity Date",
      alignment: "center",
      minWidth: 140,
    },
    {
      dataField: "outstanding_principal_balance",
      caption: "Outstanding Principal Balance",
      minWidth: 220,
    },
    {
      dataField: "status",
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
      dataField: "notes",
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
    </Box>
  );
}
export default ListPurchaseOrderLoans;
