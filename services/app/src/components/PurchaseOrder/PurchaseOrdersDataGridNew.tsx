import { Box, Button, Tooltip, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import PurchaseOrderDrawer from "components/PurchaseOrder/PurchaseOrderDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import {
  Companies,
  PurchaseOrderNewFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { parseDateStringServer } from "lib/date";
import {
  NewPurchaseOrderStatus,
  NewPurchaseOrderStatusToLabel,
} from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { computePurchaseOrderDueDateDateClient } from "lib/purchaseOrders";
import { ColumnWidths, formatRowModel, truncateString } from "lib/tables";
import { useMemo, useState } from "react";

const getProperNote = (purchaseOrder: PurchaseOrderNewFragment) => {
  if (purchaseOrder?.status === RequestStatusEnum.Rejected) {
    return purchaseOrder?.bank_rejection_note || purchaseOrder?.rejection_note;
  }
  return purchaseOrder?.status === RequestStatusEnum.Incomplete
    ? purchaseOrder?.bank_incomplete_note
    : purchaseOrder?.bank_note;
};

function getRows(purchaseOrders: PurchaseOrderNewFragment[]): RowsProp {
  return purchaseOrders.map((purchaseOrder) => {
    return formatRowModel({
      ...purchaseOrder,
      company_name: purchaseOrder.company.name,
      vendor_name: getCompanyDisplayName(purchaseOrder.vendor),
      status: purchaseOrder.new_purchase_order_status,
      order_date: !!purchaseOrder.order_date
        ? parseDateStringServer(purchaseOrder.order_date)
        : null,
      due_date: computePurchaseOrderDueDateDateClient(purchaseOrder),
      customer_note: truncateString(purchaseOrder?.customer_note || "-"),
      bank_note: truncateString(getProperNote(purchaseOrder) || ""),
      requested_at: !!purchaseOrder.requested_at
        ? parseDateStringServer(purchaseOrder.requested_at)
        : null,
    });
  });
}

interface Props {
  isApprovedByVendor?: boolean;
  isBankNoteVisible?: boolean;
  isCompanyVisible: boolean;
  isCustomerNoteVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isFilteringEnabled?: boolean;
  purchaseOrders: PurchaseOrderNewFragment[];
  actionItems?: DataGridActionItem[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleClickPurchaseOrderBankNote?: (
    purchaseOrderId: PurchaseOrders["id"]
  ) => void;
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderNewFragment[]
  ) => void;
}

export default function PurchaseOrdersDataGridNew({
  isApprovedByVendor = true,
  isBankNoteVisible = false,
  isCompanyVisible,
  isCustomerNoteVisible = true,
  isExcelExport = true,
  isFilteringEnabled = false,
  isMultiSelectEnabled = true,
  purchaseOrders,
  actionItems,
  selectedPurchaseOrderIds,
  handleClickCustomer,
  handleClickPurchaseOrderBankNote,
  handleSelectPurchaseOrders,
}: Props) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);
  const rows = getRows(purchaseOrders);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "order_number",
        caption: "PO Number",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            <ClickableDataGridCell
              onClick={() => setSelectedPurchaseOrderId(params.row.data.id)}
              label={params.row.data.order_number}
            />
            {params.row.data?.is_metrc_based && (
              <Tooltip
                arrow
                interactive
                title={"Purchase order created from Metrc manifest"}
              >
                <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
              </Tooltip>
            )}
          </Box>
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
        width: 250,
        alignment: "center",
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: [
                NewPurchaseOrderStatus.ReadyToRequestFinancing,
                NewPurchaseOrderStatus.PendingApprovalByBespoke,
                NewPurchaseOrderStatus.FinancingRequestApproved,
              ].map((d) => ({
                status: d,
                label: NewPurchaseOrderStatusToLabel[d],
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "label",
        },
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
        dataField: "requested_at",
        format: "shortDate",
        caption: "Date Submitted",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        dataField: "amount",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isApprovedByVendor,
        caption: "Amount Funded",
        dataField: "amount_funded",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "order_date",
        format: "shortDate",
        caption: "PO Date",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        dataField: "due_date",
        format: "shortDate",
        caption: "Due Date",
        width: ColumnWidths.Date,
        alignment: "center",
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
      actionItems,
      handleClickCustomer,
      handleClickPurchaseOrderBankNote,
    ]
  );

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectPurchaseOrders &&
        handleSelectPurchaseOrders(
          selectedRowsData as PurchaseOrderNewFragment[]
        ),
    [handleSelectPurchaseOrders]
  );

  return (
    <Box display="flex" flexDirection="column">
      {!!selectedPurchaseOrderId && (
        <PurchaseOrderDrawer
          purchaseOrderId={selectedPurchaseOrderId}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      <ControlledDataGrid
        pager
        select={isMultiSelectEnabled}
        isExcelExport={isExcelExport}
        filtering={filtering}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedPurchaseOrderIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </Box>
  );
}
