import { IconButton } from "@material-ui/core";
import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { LaunchOutlined } from "@material-ui/icons";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFragment,
  useListPurchaseOrdersQuery,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";
import ViewModal from "../ViewPurhcaseOrder/ViewModal";
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
  manipulatePurchaseOrder: (
    actionType: ActionType,
    originalPurchaseOrder: Maybe<PurchaseOrderFragment>
  ) => void;
}

function ListPurchaseOrders({ companyId, manipulatePurchaseOrder }: Props) {
  const { user } = useContext(CurrentUserContext);
  const [currentId, setCurrentId] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useListPurchaseOrdersQuery({
    variables: {
      company_id: companyId ? companyId : user.companyId,
    },
  });

  const rows = populateRows(data ? data.purchase_orders : []);

  const columns: ColDef[] = [
    {
      field: "vendor_name",
      headerName: "Vendor",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Purchase Order Amount",
      width: 200,
    },
    {
      field: "status",
      headerName: "Purchase Order Status",
      width: 200,
      renderCell: (params: ValueFormatterParams) => (
        <Status statusValue={params.value as string} />
      ),
    },
    {
      field: "see_more",
      headerName: "See More",
      width: 100,
      renderCell: (params: ValueFormatterParams) => (
        <IconButton
          onClick={() => {
            setCurrentId(params.row.id as string);
            setOpen(true);
          }}
        >
          <LaunchOutlined></LaunchOutlined>
        </IconButton>
      ),
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
            purchaseOrderId={params.row.id as string}
            manipulatePurchaseOrder={handleCreatePurchaseOrderReplica}
          />
        );
      },
    });
  }

  const handleCreatePurchaseOrderReplica = (
    actionType: ActionType,
    originalId: string
  ) => {
    manipulatePurchaseOrder(
      actionType,
      data?.purchase_orders.find((po) => po.id === originalId)
    );
  };

  return (
    <>
      {open && (
        <ViewModal
          manipulatePurchaseOrder={handleCreatePurchaseOrderReplica}
          id={currentId}
          handleClose={() => setOpen(false)}
        ></ViewModal>
      )}
      <div style={{ height: "700px", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </>
  );
}

export default ListPurchaseOrders;
