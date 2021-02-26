import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { PurchaseOrderFragment, RequestStatusEnum } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

function populateRows(
  purchaseOrders: Maybe<PurchaseOrderFragment[]>
): RowsProp {
  return purchaseOrders
    ? purchaseOrders.map((purchaseOrder) => {
        return {
          ...purchaseOrder,
          company_name: purchaseOrder.company?.name,
          vendor_name: purchaseOrder.vendor?.name,
        };
      })
    : [];
}

interface Props {
  isCompanyVisible: boolean;
  purchaseOrders: PurchaseOrderFragment[];
  actionItems: DataGridActionItem[];
}

function PurchaseOrdersDataGrid({
  isCompanyVisible,
  purchaseOrders,
  actionItems,
}: Props) {
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
        />
      ),
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 75,
      visible: actionItems.length > 0,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
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
      visible: isCompanyVisible,
      dataField: "company_name",
      caption: "Customer",
    },
    {
      dataField: "vendor_name",
      caption: "Vendor",
    },
    {
      caption: "Amount",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      caption: "Order Date",
      alignment: "center",
      width: 115,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.order_date} />
      ),
    },
    {
      caption: "Delivery Date",
      alignment: "center",
      width: 115,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.delivery_date} />
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid dataSource={rows} columns={columns} pager />
    </Box>
  );
}
export default PurchaseOrdersDataGrid;
