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
  handleEditPurchaseOrderLoan: (purchaseOrderLoanId: string) => void;
}

function ListPurchaseOrderLoans({
  purchaseOrderLoans,
  handleEditPurchaseOrderLoan,
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
      handleClickEdit={() =>
        handleEditPurchaseOrderLoan(params.row.data.id as string)
      }
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
      dataField: "amount",
      caption: "Amount",
      width: 150,
    },
    {
      dataField: "amount_owed",
      caption: "Amount Owed",
      width: 150,
    },
    {
      dataField: "adjusted_maturity_date",
      caption: "Maturity Date",
      width: 200,
    },
    {
      dataField: "outstanding_principal_balance",
      caption: "Outstanding Principal Balance",
      width: 220,
    },
    {
      dataField: "status",
      caption: "Status",
      width: 150,
    },
  ];

  if (check(user.role, Action.ViewPurchaseOrderLoansActionMenu)) {
    columns.push({
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 100,
      cellRender: actionCellRenderer,
    });
  }

  return (
    <div style={{ minHeight: "500px", width: "100%" }}>
      <DataGrid height={"100%"} width={"100%"} dataSource={rows}>
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
