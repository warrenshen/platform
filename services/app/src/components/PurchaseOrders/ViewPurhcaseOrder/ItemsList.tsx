import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { PurchaseOrderLineItemFragment } from "generated/graphql";

function populateRows(
  purchaseOrderItems: PurchaseOrderLineItemFragment[]
): RowsProp {
  return [
    ...purchaseOrderItems.map((item) => {
      return { ...item, total: item.num_units * item.price_per_unit };
    }),
    {
      id: "",
      item: "Total",
      description: "",
      units: "",
      price_per_unit: "",
      unit: "",
      total: purchaseOrderItems.reduce(
        (acc, cur) => (acc += cur.price_per_unit * cur.num_units),
        0
      ),
    },
  ];
}

interface Props {
  purchaseOrderItems: PurchaseOrderLineItemFragment[];
}

function ItemsList({ purchaseOrderItems }: Props) {
  const columns: ColDef[] = [
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
      field: "num_units",
      headerName: "Units",
      width: 100,
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
    },
    {
      field: "price_per_unit",
      headerName: "Price Per Unit",
      width: 100,
      valueFormatter: (params: ValueFormatterParams) => {
        return params.value ? `$${params.value}.00` : "";
      },
    },
    {
      field: "total",
      headerName: "Total",
      width: 100,
      valueFormatter: (params: ValueFormatterParams) => {
        return params.value ? `$${params.value}.00` : "";
      },
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
