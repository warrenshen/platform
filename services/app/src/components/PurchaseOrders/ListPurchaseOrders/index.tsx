import { Button } from "@material-ui/core";
import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { useEffect, useState } from "react";
import { PURCHASE_ORDERS, VENDORS } from "../models/fakeData";
import { PurchaseOrder } from "../models/PurchaseOrder";
import ViewModal from "../ViewPurhcaseOrder/ViewModal";
import ActionMenu from "./ActionMenu";
import Status from "./Status";

function populateRows(purchaseOrders: PurchaseOrder[]): RowsProp {
  return purchaseOrders.map((item) => {
    return { ...item, action: 1 };
  });
}

interface Props {
  reloadTrigger: boolean;
  createPurchaseOrderReplica: (arg0: string) => void;
}

function ListPurchaseOrders({
  reloadTrigger,
  createPurchaseOrderReplica,
}: Props) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPurchaseOrders(
      PURCHASE_ORDERS.filter((po) => po.associatedPurchaseOrderIds.length === 0)
    );
  }, [reloadTrigger]);

  const rows = populateRows(purchaseOrders);

  const columns: ColDef[] = [
    {
      field: "vendor_id",
      headerName: "Anchor",
      width: 200,
      valueFormatter: (params: ValueFormatterParams) => {
        const vendor = VENDORS.find((v) => v.id === params.value);
        return `${vendor ? vendor.name : ""}`;
      },
    },
    {
      field: "parent_purchase_order_id",
      headerName: "Parent PO Number",
      width: 200,
      valueFormatter: (params: ValueFormatterParams) => {
        const parentPO = PURCHASE_ORDERS.find((po) => po.id === params.value);
        return `${parentPO ? parentPO.purchase_order_number : ""}`;
      },
    },
    {
      field: "purchase_order_number",
      headerName: "PO Number",
      width: 250,
      renderCell: (params: ValueFormatterParams) => (
        // <ViewButton id={params.row.id as string} name={params.value as string} />
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
      valueFormatter: (params: ValueFormatterParams) => `$${params.value}.00`,
    },
    {
      field: "amount_invoiced",
      headerName: "Amount Invoiced",
      width: 150,
      valueFormatter: (params: ValueFormatterParams) => `$${params.value}.00`,
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
            createPurchaseOrderReplica={createPurchaseOrderReplica}
          />
        );
      },
    },
  ];
  return (
    <>
      {open && (
        <ViewModal
          createPurchaseOrderReplica={createPurchaseOrderReplica}
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
