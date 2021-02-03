import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
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
  handleViewPurchaseOrder: (purchaseOrderId: string) => void;
}

function ListPurchaseOrders({
  purchaseOrders,
  handleEditPurchaseOrder,
  handleViewPurchaseOrder,
}: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = populateRows(purchaseOrders);

  const statusCellRenderer = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const actionCellRenderer = (params: ValueFormatterParams) => (
    <ActionMenu
      actionItems={[
        {
          key: "view-purchase-order",
          label: "View",
          handleClick: () =>
            handleViewPurchaseOrder(params.row.data.id as string),
        },
        {
          key: "edit-purchase-order",
          label: "Edit",
          handleClick: () =>
            handleEditPurchaseOrder(params.row.data.id as string),
        },
      ]}
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
    {
      dataField: "order_number",
      caption: "Order Number",
      minWidth: 150,
    },
    {
      dataField: "vendor_name",
      caption: "Vendor",
      minWidth: 200,
    },
    {
      dataField: "amount",
      alignment: "left",
      caption: "Amount",
      minWidth: 120,
    },
    {
      dataField: "order_date",
      caption: "Order Date",
      alignment: "center",
      minWidth: 130,
    },
    {
      dataField: "delivery_date",
      caption: "Delivery Date",
      alignment: "center",
      minWidth: 130,
    },
    {
      dataField: "loans",
      caption: "Loans",
      minWidth: 150,
    },
    {
      dataField: "status",
      caption: "Status",
      minWidth: 175,
      alignment: "center",
      cellRender: statusCellRenderer,
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      visible: check(user.role, Action.ViewPurchaseOrdersActionMenu),
      cellRender: actionCellRenderer,
    },
  ];

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <DataGrid height={"100%"} width={"100%"} dataSource={rows}>
        {columns.map(
          ({
            dataField,
            minWidth,
            caption,
            visible,
            alignment,
            cellRender,
          }) => (
            <Column
              key={dataField}
              caption={caption}
              dataField={dataField}
              alignment={alignment}
              minWidth={minWidth}
              visible={visible}
              cellRender={cellRender}
            />
          )
        )}
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
