import { Box, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import CommentIcon from "@material-ui/icons/Comment";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import UpdatePurchaseOrderBankNote from "components/PurchaseOrder/UpdatePurchaseOrderBankNote";
import ModalButton from "components/Shared/Modal/ModalButton";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  PurchaseOrderFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(purchaseOrders: PurchaseOrderFragment[]): RowsProp {
  return purchaseOrders.map((purchaseOrder) => ({
    ...purchaseOrder,
    company_name: purchaseOrder.company?.name,
    vendor_name: purchaseOrder.vendor?.name,
    customer_note: !!purchaseOrder.customer_note
      ? purchaseOrder.customer_note.length > 64
        ? `${purchaseOrder.customer_note.substring(0, 64)}...`
        : purchaseOrder.customer_note
      : "-",
    bank_note: !!purchaseOrder.bank_note
      ? purchaseOrder.bank_note.length > 64
        ? `${purchaseOrder.bank_note.substring(0, 64)}...`
        : purchaseOrder.bank_note
      : "",
  }));
}

interface Props {
  isBankNoteVisible?: boolean;
  isCompanyVisible: boolean;
  isCustomerNoteVisible?: boolean;
  isDeliveryDateVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  purchaseOrders: PurchaseOrderFragment[];
  actionItems?: DataGridActionItem[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderFragment[]
  ) => void;
}

export default function PurchaseOrdersDataGrid({
  isBankNoteVisible = false,
  isCompanyVisible,
  isCustomerNoteVisible = true,
  isDeliveryDateVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = true,
  purchaseOrders,
  actionItems,
  selectedPurchaseOrderIds,
  handleSelectPurchaseOrders,
}: Props) {
  const rows = getRows(purchaseOrders);
  console.log({ rows });
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
        visible: isDeliveryDateVisible,
        caption: "Delivery Date",
        dataField: "delivery_date",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.delivery_date} />
        ),
      },
      {
        visible: isCustomerNoteVisible,
        caption: "Comments",
        dataField: "customer_note",
        width: ColumnWidths.Comment,
      },
      {
        visible: isBankNoteVisible,
        caption: "Bank Note",
        dataField: "bank_note",
        width: 340,
        cellRender: (params: ValueFormatterParams) => (
          <ModalButton
            label={
              <Box display="flex" alignItems="center">
                <CommentIcon />
                {!!params.row.data.bank_note && (
                  <Box ml={1}>
                    <Typography variant="body2">
                      {params.row.data.bank_note}
                    </Typography>
                  </Box>
                )}
              </Box>
            }
            color="default"
            textAlign="left"
            variant="text"
            modal={({ handleClose }) => (
              <UpdatePurchaseOrderBankNote
                purchaseOrderId={params.row.data.id}
                handleClose={handleClose}
              />
            )}
          />
        ),
      },
    ],
    [
      isBankNoteVisible,
      isCompanyVisible,
      isCustomerNoteVisible,
      isDeliveryDateVisible,
      actionItems,
    ]
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
