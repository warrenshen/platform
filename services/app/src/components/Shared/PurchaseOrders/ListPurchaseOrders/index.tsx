import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
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

  const statusCellRenderer = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const actionCellRenderer = (params: ValueFormatterParams) => (
    <ActionMenu
      handleClickEdit={() =>
        handleEditPurchaseOrder(params.row.data.id as string)
      }
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
    {
      dataField: "order_number",
      caption: "Order Number",
      width: 150,
    },
    {
      dataField: "vendor_name",
      caption: "Vendor",
      width: 200,
    },
    {
      dataField: "amount",
      caption: "Amount",
      width: 120,
    },
    {
      dataField: "order_date",
      caption: "Order Date",
      alignment: "center",
      width: 130,
    },
    {
      dataField: "delivery_date",
      caption: "Delivery Date",
      alignment: "center",
      width: 130,
    },
    {
      dataField: "loans",
      caption: "Loans",
      width: 150,
    },
    {
      dataField: "status",
      caption: "Status",
      width: 175,
      alignment: "center",
      cellRender: statusCellRenderer,
    },
  ];

  if (check(user.role, Action.ViewPurchaseOrdersActionMenu)) {
    columns.push({
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 100,
      cellRender: actionCellRenderer,
    });
  }

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <DataGrid height={"100%"} width={"100%"} dataSource={rows}>
        {columns.map(({ dataField, width, caption, alignment, cellRender }) => (
          <Column
            key={dataField}
            caption={caption}
            dataField={dataField}
            alignment={alignment}
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

export default ListPurchaseOrders;
