import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import PurchaseOrderDrawerLauncher from "components/Shared/PurchaseOrder/PurchaseOrderDrawerLauncher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { PurchaseOrderFragment, RequestStatusEnum } from "generated/graphql";
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
          vendor_name: item.vendor?.name,
        };
      })
    : [];
}

interface Props {
  purchaseOrders: PurchaseOrderFragment[];
  actionItems: DataGridActionItem[];
}

function PurchaseOrdersDataGrid({ purchaseOrders, actionItems }: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = populateRows(purchaseOrders);

  const columns: IColumnProps[] = [
    {
      dataField: "order_number",
      caption: "Order Number",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <PurchaseOrderDrawerLauncher
          label={params.row.data.order_number as string}
          purchaseOrderId={params.row.data.id as string}
        ></PurchaseOrderDrawerLauncher>
      ),
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
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.amount}
        ></CurrencyDataGridCell>
      ),
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
      cellRender: (params: ValueFormatterParams) => (
        <RequestStatusChip requestStatus={params.value as RequestStatusEnum} />
      ),
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      visible: check(user.role, Action.ViewPurchaseOrdersActionMenu),
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu
          params={params}
          actionItems={actionItems}
        ></DataGridActionMenu>
      ),
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

export default PurchaseOrdersDataGrid;
