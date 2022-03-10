import { Button, Box, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import ProgressBarDataGridCell from "components/Shared/DataGrid/ProgressBarDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatCurrency } from "lib/number";
import { ColumnWidths, truncateString } from "lib/tables";
import { useMemo } from "react";

function getRows(purchaseOrders: PurchaseOrderFragment[]): RowsProp {
  return purchaseOrders.map((purchaseOrder) => ({
    ...purchaseOrder,
    company_name: purchaseOrder.company.name,
    vendor_name: getCompanyDisplayName(purchaseOrder.vendor),
    status: purchaseOrder.status,
    percent_funded:
      ((purchaseOrder.amount_funded || 0) / (purchaseOrder.amount || 1)) * 100,
    customer_note: truncateString(purchaseOrder?.customer_note || "-"),
    bank_note: truncateString(purchaseOrder?.bank_note || ""),
  }));
}

interface Props {
  isApprovedByVendor?: boolean;
  isBankNoteVisible?: boolean;
  isBankView?: boolean;
  isCompanyVisible: boolean;
  isCustomerNoteVisible?: boolean;
  isDeliveryDateVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  purchaseOrders: PurchaseOrderFragment[];
  actionItems?: DataGridActionItem[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleClickPurchaseOrderBankNote?: (
    purchaseOrderId: PurchaseOrders["id"]
  ) => void;
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
  handleClickPurchaseOrderBankNote,
  handleSelectPurchaseOrders,
}: Props) {
  const rows = getRows(purchaseOrders);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "order_number",
        caption: "PO Number",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <PurchaseOrderDrawerLauncher
            label={params.row.data.order_number}
            isMetrcBased={params.row.data.is_metrc_based}
            purchaseOrderId={params.row.data.id}
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
          <ProgressBarDataGridCell
            percentValue={params.row.data.percent_funded}
            tooltipLabel={`${formatCurrency(
              params.row.data.amount_funded || 0
            )} funded`}
          />
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
          <Button
            color="default"
            variant="text"
            style={{
              minWidth: 0,
              textAlign: "left",
            }}
            onClick={() =>
              !!handleClickPurchaseOrderBankNote &&
              handleClickPurchaseOrderBankNote(params.row.data.id)
            }
          >
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
          </Button>
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
      handleClickPurchaseOrderBankNote,
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
