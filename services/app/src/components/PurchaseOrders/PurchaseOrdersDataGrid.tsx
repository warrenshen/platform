import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  PurchaseOrderFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { useMemo } from "react";

interface Props {
  isCompanyVisible: boolean;
  isMultiSelectEnabled?: boolean;
  purchaseOrders: PurchaseOrderFragment[];
  actionItems?: DataGridActionItem[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderFragment[]
  ) => void;
}

function PurchaseOrdersDataGrid({
  isCompanyVisible,
  isMultiSelectEnabled = true,
  purchaseOrders,
  actionItems,
  selectedPurchaseOrderIds,
  handleSelectPurchaseOrders,
}: Props) {
  const rows = useMemo(
    () =>
      purchaseOrders.map((purchaseOrder) => ({
        ...purchaseOrder,
        company_name: purchaseOrder.company?.name,
        vendor_name: purchaseOrder.vendor?.name,
      })),
    [purchaseOrders]
  );
  const columns = useMemo(
    () => [
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
        visible: !!actionItems && actionItems.length > 0,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        dataField: "status",
        caption: "Status",
        width: 120,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <RequestStatusChip
            requestStatus={params.value as RequestStatusEnum}
          />
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
    ],
    [isCompanyVisible, actionItems]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectPurchaseOrders &&
      handleSelectPurchaseOrders(selectedRowsData as PurchaseOrderFragment[]),
    [handleSelectPurchaseOrders]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        select={isMultiSelectEnabled}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedPurchaseOrderIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </Box>
  );
}
export default PurchaseOrdersDataGrid;
