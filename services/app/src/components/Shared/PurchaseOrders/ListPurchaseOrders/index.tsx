import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import CreateUpdatePurchaseOrderModal from "components/Shared/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFragment,
  useListPurchaseOrdersQuery,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";
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
  companyId: string;
}

function ListPurchaseOrders({ companyId }: Props) {
  const { user } = useContext(CurrentUserContext);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useListPurchaseOrdersQuery({
    variables: {
      company_id: companyId ? companyId : user.companyId,
    },
  });

  const rows = populateRows(data ? data.purchase_orders : []);

  const columns: ColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params: ValueFormatterParams) => (
        <Status statusValue={params.value as string} />
      ),
    },
    {
      field: "vendor_name",
      headerName: "Vendor",
      width: 200,
    },
    {
      field: "order_number",
      headerName: "Order Number",
      width: 200,
    },
    {
      field: "order_date",
      headerName: "Order Date",
      width: 200,
    },
    {
      field: "delivery_date",
      headerName: "Delivery Date",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
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
            handleClickEdit={() => {
              setSelectedPurchaseOrderId(params.row.id as string);
              setOpen(true);
            }}
          ></ActionMenu>
        );
      },
    });
  }

  return (
    <div style={{ height: "700px", width: "100%" }}>
      {open && (
        <CreateUpdatePurchaseOrderModal
          actionType={ActionType.Update}
          purchaseOrderId={selectedPurchaseOrderId}
          handleClose={() => setOpen(false)}
        ></CreateUpdatePurchaseOrderModal>
      )}
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
