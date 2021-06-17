import { Box, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import UpdatePurchaseOrderBankNote from "components/PurchaseOrder/UpdatePurchaseOrderBankNote";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { ColumnWidths, truncateString } from "lib/tables";
import { useMemo } from "react";

function getRows(purchaseOrders: PurchaseOrderFragment[]): RowsProp {
  return purchaseOrders.map((purchaseOrder) => ({
    ...purchaseOrder,
    company_name: purchaseOrder.company.name,
    vendor_name: purchaseOrder.vendor?.name,
    customer_note: truncateString(purchaseOrder?.customer_note || "-"),
    bank_note: truncateString(purchaseOrder?.bank_note || ""),
  }));
}

interface Props {
  isApprovedByVendor?: boolean;
  isBankNoteVisible?: boolean;
  isCompanyVisible: boolean;
  isCustomerNoteVisible?: boolean;
  isDeliveryDateVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  purchaseOrders: PurchaseOrderFragment[];
  actionItems?: DataGridActionItem[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderFragment[]
  ) => void;
}

export default function PurchaseOrdersDataGrid({
  isApprovedByVendor = true,
  isBankNoteVisible = false,
  isCompanyVisible,
  isCustomerNoteVisible = true,
  isDeliveryDateVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = true,
  purchaseOrders,
  actionItems,
  selectedPurchaseOrderIds,
  handleClickCustomer,
  handleSelectPurchaseOrders,
}: Props) {
  const rows = getRows(purchaseOrders);
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
        cellRender: (params: ValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company_name}
              onClick={() => handleClickCustomer(params.row.data.company.id)}
            />
          ) : (
            params.row.data.company_name
          ),
      },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.vendor_name} />
        ),
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
        visible: isApprovedByVendor,
        caption: "Amount Funded",
        dataField: "amount_funded",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount_funded} />
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
      isApprovedByVendor,
      isCustomerNoteVisible,
      isDeliveryDateVisible,
      actionItems,
      handleClickCustomer,
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
