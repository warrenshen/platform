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
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible: boolean;
  isMultiSelectEnabled?: boolean;
  isExcelExport?: boolean;
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
  isExcelExport = true,
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
        caption: "PO Number",
        minWidth: ColumnWidths.MinWidth,
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
        width: ColumnWidths.Actions,
        visible: !!actionItems && actionItems.length > 0,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        dataField: "status",
        caption: "Confirmation Status",
        width: ColumnWidths.Status,
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
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        caption: "PO Date",
        dataField: "order_date",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.order_date} />
        ),
      },
      {
        caption: "Delivery Date",
        dataField: "delivery_date",
        width: ColumnWidths.Date,
        alignment: "center",
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
    <ControlledDataGrid
      pager
      select={isMultiSelectEnabled}
      isExcelExport={isExcelExport}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedPurchaseOrderIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
export default PurchaseOrdersDataGrid;
