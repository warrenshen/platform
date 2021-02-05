import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
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

  const renderAmount = (params: ValueFormatterParams) => (
    <CurrencyDataGridCell value={params.row.data.amount}></CurrencyDataGridCell>
  );

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
      caption: "Amount",
      alignment: "right",
      minWidth: 120,
      cellRender: renderAmount,
    },
    {
      caption: "Order Date",
      alignment: "right",
      minWidth: 130,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.order_date}
        ></DateDataGridCell>
      ),
    },
    {
      caption: "Delivery Date",
      alignment: "right",
      minWidth: 130,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.delivery_date}
        ></DateDataGridCell>
      ),
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
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <DataGrid height={"100%"} wordWrapEnabled={true} dataSource={rows}>
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
              key={caption}
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
    </Box>
  );
}

export default ListPurchaseOrders;
