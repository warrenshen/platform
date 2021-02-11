import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import PurchaseOrderDrawerLauncher from "components/Shared/PurchaseOrder/PurchaseOrderDrawerLauncher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
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

  const columns = [
    {
      dataField: "order_number",
      width: 140,
      caption: "Order Number",
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
    },
    {
      caption: "Amount",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.amount}
        ></CurrencyDataGridCell>
      ),
    },
    {
      caption: "Order Date",
      alignment: "center",
      width: 115,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.order_date}
        ></DateDataGridCell>
      ),
    },
    {
      caption: "Delivery Date",
      alignment: "center",
      width: 115,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.delivery_date}
        ></DateDataGridCell>
      ),
    },
    {
      dataField: "loans",
      caption: "Loans",
    },
    {
      dataField: "status",
      caption: "Status",
      width: 165,
      alignment: "center",
      cellRender: (params: ValueFormatterParams) => (
        <RequestStatusChip requestStatus={params.value as RequestStatusEnum} />
      ),
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 75,
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
      <ControlledDataGrid
        dataSource={rows}
        columns={columns}
        pager
      ></ControlledDataGrid>
    </Box>
  );
}
export default PurchaseOrdersDataGrid;
