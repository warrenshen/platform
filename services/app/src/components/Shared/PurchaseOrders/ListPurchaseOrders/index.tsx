import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { PurchaseOrderFragment } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";
import ActionMenu from "./ActionMenu";
import Status from "./Status";

function populateRows(
  purchaseOrders: Maybe<PurchaseOrderFragment[]>
): RowsProp {
  return purchaseOrders
    ? purchaseOrders.map((item) => {
        return {
          ...item,
          action: 1,
          vendor_name: item.vendor?.name,
        };
      })
    : [];
}

interface Props {
  purchaseOrders: PurchaseOrderFragment[];
  handleEditPurchaseOrder: (purchaseOrderId: string) => void;
}

function ListPurchaseOrders({
  purchaseOrders,
  handleEditPurchaseOrder,
}: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = populateRows(purchaseOrders);

  const columns: ColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 150,
    },
    {
      field: "order_number",
      headerName: "Order Number",
      width: 150,
    },
    {
      field: "vendor_name",
      headerName: "Vendor",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params: ValueFormatterParams) => (
        <Status statusValue={params.value as string} />
      ),
    },
    {
      field: "order_date",
      headerName: "Order Date",
      width: 150,
    },
    {
      field: "delivery_date",
      headerName: "Delivery Date",
      width: 150,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
    },
  ];

  if (check(user.role, Action.ViewPurchaseOrdersActionMenu)) {
    columns.push({
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params: ValueFormatterParams) => {
        return (
          <ActionMenu
            handleClickEdit={() =>
              handleEditPurchaseOrder(params.row.id as string)
            }
          ></ActionMenu>
        );
      },
    });
  }

  return (
    <div style={{ height: "700px", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </div>
  );
}

export default ListPurchaseOrders;
