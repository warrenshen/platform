import { Button } from "@material-ui/core";
import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFragment,
  useListPurchaseOrdersQuery,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { useContext, useState } from "react";
import { ActionType } from "../models/ActionType";
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
          parent_purchase_order_number:
            item.parent_purchase_order?.purchase_order_number,
        };
      })
    : [];
}

interface Props {
  manipulatePurchaseOrder: (
    actionType: ActionType,
    originalPurchaseOrder: Maybe<PurchaseOrderFragment>
  ) => void;
}

function ListPurchaseOrders({ manipulatePurchaseOrder }: Props) {
  const { company_id: curentUserCompanyId } = useContext(CurrentUserContext);
  const [currentId, setCurrentId] = useState("");
  const [open, setOpen] = useState(false);

  const { data, loading } = useListPurchaseOrdersQuery({
    variables: {
      company_id: curentUserCompanyId,
    },
  });

  const rows = populateRows(data ? data.purchase_orders : []);

  const columns: ColDef[] = [
    {
      field: "vendor_name",
      headerName: "Anchor",
      width: 200,
    },
    {
      field: "parent_purchase_order_number",
      headerName: "Parent PO Number",
      width: 200,
    },
    {
      field: "purchase_order_number",
      headerName: "PO Number",
      width: 250,
      renderCell: (params: ValueFormatterParams) => (
        <Button
          onClick={() => {
            setCurrentId(params.row.id as string);
            setOpen(true);
          }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "amount",
      headerName: "Purchase Order Amount",
      width: 200,
    },
    {
      field: "amount_invoiced",
      headerName: "Amount Invoiced",
      width: 150,
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
    },
  ];

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
