import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { PurchaseOrderItem } from "../models/PurchaseOrderItem";

function populateRows(purchaseOrderItems: PurchaseOrderItem[]): RowsProp {
  return purchaseOrderItems.map((item) => {
    return { ...item, total: item.units * item.pricePerUnit };
  });
}

interface Props {
  purchaseOrderItems: PurchaseOrderItem[];
}

function ItemsList({ purchaseOrderItems }: Props) {
  const columns: ColDef[] = [
    { field: "id", headerName: "Number", width: 100 },
    {
      field: "item",
      headerName: "Item Name",
      width: 200,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
    },
    {
      field: "units",
      headerName: "Units",
      width: 100,
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
    },
    {
      field: "pricePerUnit",
      headerName: "Price Per Unit",
      width: 100,
      valueFormatter: (params: ValueFormatterParams) => `$${params.value}.00`,
    },
    {
      field: "total",
      headerName: "Total",
      width: 100,
      valueFormatter: (params: ValueFormatterParams) => `$${params.value}.00`,
    },
  ];

  const rows = populateRows(purchaseOrderItems);
  return (
    <>
      <div style={{ height: "300px", width: "1000px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </>
  );
}

export default ItemsList;
