import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import Launcher from "components/Shared/PurchaseOrderLoanDrawer/Launcher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { Maybe, PurchaseOrderLoanFragment } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";

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
      width: 150,
    },
    {
      dataField: "loan.amount",
      caption: "Amount",
      width: 150,
    },
    {
      dataField: "loan.origination_date",
      caption: "Origination Date",
      width: 200,
    },
    {
      dataField: "loan.adjusted_maturity_date",
      caption: "Maturity Date",
      width: 200,
    },
    {
      dataField: "loan.outstanding_principal_balance",
      caption: "Outstanding Principal Balance",
      width: 220,
    },
    {
      dataField: "loan.status",
      caption: "Status",
      width: 150,
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 100,
      cellRender: actionCellRenderer,
    },
  ];

  if (check(user.role, Action.ViewLoanInternalNote)) {
    columns.push({
      dataField: "loan.notes",
      caption: "Internal Note",
      width: 300,
      cellRender: (params: ValueFormatterParams) => (
        <Box>{params.row.data.loan.notes as string}</Box>
      ),
    });
  }

  return (
    <div style={{ minHeight: "500px", width: "100%" }}>
      <DataGrid
        height={"100%"}
        width={"100%"}
        dataSource={rows}
        wordWrapEnabled={true}
      >
        {columns.map(({ dataField, width, caption, cellRender }) => (
          <Column
            key={dataField}
            caption={caption}
            dataField={dataField}
            width={width}
            cellRender={cellRender}
          />
        ))}
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
