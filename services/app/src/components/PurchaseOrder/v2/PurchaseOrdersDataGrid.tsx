import { Box, Button, Tooltip, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import BankPurchaseOrderDrawer from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import PurchaseOrderStatusChip from "components/Shared/Chip/PurchaseOrderStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import ProgressBarDataGridCell from "components/Shared/DataGrid/ProgressBarDataGridCell";
import ClickableDataGridCell from "components/Shared/DataGrid/v2/ClickableDataGridCell";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrderNewFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { parseDateStringServer } from "lib/date";
import {
  NewPurchaseOrderStatus,
  NewPurchaseOrderStatusToLabel,
  PlatformModeEnum,
} from "lib/enum";
import { CurrencyPrecision, formatCurrency } from "lib/number";
import { computePurchaseOrderDueDateDateStringClientNew } from "lib/purchaseOrders";
import { ColumnWidths, formatRowModel, truncateString } from "lib/tables";
import { useContext, useMemo, useState } from "react";

const getProperNote = (purchaseOrder: PurchaseOrderFragment) => {
  if (purchaseOrder?.status === RequestStatusEnum.Rejected) {
    return purchaseOrder?.bank_rejection_note || purchaseOrder?.rejection_note;
  }
  return purchaseOrder?.status === RequestStatusEnum.Incomplete
    ? purchaseOrder?.bank_incomplete_note
    : purchaseOrder?.bank_note;
};

function getRows(purchaseOrders: PurchaseOrderFragment[]) {
  return purchaseOrders.map((purchaseOrder) => {
    return formatRowModel({
      ...purchaseOrder,
      bank_note: truncateString(getProperNote(purchaseOrder) || ""),
      company_name: purchaseOrder.company.name,
      customer_note: truncateString(purchaseOrder?.customer_note || "-"),
      due_date: computePurchaseOrderDueDateDateStringClientNew(purchaseOrder),
      percent_funded:
        ((purchaseOrder.amount_funded || 0) / (purchaseOrder.amount || 1)) *
        100,
      order_date: !!purchaseOrder.order_date
        ? parseDateStringServer(purchaseOrder.order_date)
        : null,
      requested_at: !!purchaseOrder.requested_at
        ? parseDateStringServer(purchaseOrder.requested_at, true)
        : null,
      status: purchaseOrder.status,
      status_notes: purchaseOrder.all_customer_notes?.status_notes,
      vendor_name: getCompanyDisplayName(purchaseOrder.vendor),
    });
  });
}

interface Props {
  isApprovedByVendor?: boolean;
  isBankNoteVisible?: boolean;
  isCompanyVisible: boolean;
  isStatusVisible?: boolean;
  isCustomerNoteVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isFilteringEnabled?: boolean;
  isVendorVisible?: boolean;
  dataCy?: string;
  purchaseOrders: PurchaseOrderFragment[];
  actionItems?: DataGridActionItem[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  selectablePurchaseOrderStatuses: NewPurchaseOrderStatus[];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleClickPurchaseOrderBankNote?: (
    purchaseOrderId: PurchaseOrders["id"]
  ) => void;
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderNewFragment[]
  ) => void;
}

export default function PurchaseOrdersDataGrid({
  isApprovedByVendor = true,
  isBankNoteVisible = false,
  isCompanyVisible,
  isStatusVisible = true,
  isCustomerNoteVisible = true,
  isExcelExport = true,
  isFilteringEnabled = false,
  isMultiSelectEnabled = true,
  isVendorVisible = true,
  dataCy = "",
  purchaseOrders,
  actionItems,
  selectedPurchaseOrderIds,
  selectablePurchaseOrderStatuses,
  handleClickCustomer,
  handleClickPurchaseOrderBankNote,
  handleSelectPurchaseOrders,
}: Props) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;
  const rows = getRows(purchaseOrders);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "order_number",
        caption: "PO Number",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            <ClickableDataGridCell
              onClick={() => {
                setSelectedPurchaseOrderId(params.row.data.id);
              }}
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
        cellRender: (params: GridValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        visible: isStatusVisible,
        dataField: "new_purchase_order_status",
        caption: "Status",
        width: ColumnWidths.StatusChip,
        alignment: "left",
        cellRender: (params: GridValueFormatterParams) => {
          return (
            <PurchaseOrderStatusChip
              purchaseOrderStatus={
                params.row.data
                  .new_purchase_order_status as NewPurchaseOrderStatus
              }
            />
          );
        },
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: selectablePurchaseOrderStatuses.map(
                (purchaseOrderStatus) => ({
                  new_purchase_order_status: purchaseOrderStatus,
                  label: NewPurchaseOrderStatusToLabel[purchaseOrderStatus],
                })
              ),
              key: "new_purchase_order_status",
            },
          },
          valueExpr: "new_purchase_order_status",
          displayExpr: "label",
        },
      },
      {
        visible: isStatusVisible,
        dataField: "status_notes",
        caption: "Status Notes",
        width: ColumnWidths.StatusChip,
        alignment: "left",
      },
      {
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) =>
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
        visible: isVendorVisible,
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "requested_at",
        caption: "Date Submitted to Vendor",
        width: ColumnWidths.Date,
        alignment: "center",
        format: "shortDate",
      },
      {
        caption: "Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
      {
        visible: isApprovedByVendor,
        caption: "Amount Funded",
        dataField: "amount_funded",
        width: ColumnWidths.Currency,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
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
        format: "shortDate",
      },
      {
        caption: "Due Date",
        dataField: "due_date",
        width: ColumnWidths.Date,
        alignment: "center",
        format: "shortDate",
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
        cellRender: (params: GridValueFormatterParams) => (
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
      isStatusVisible,
      isVendorVisible,
      actionItems,
      selectablePurchaseOrderStatuses,
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
      ({ selectedRowsData }: any) => {
        handleSelectPurchaseOrders &&
          handleSelectPurchaseOrders(
            selectedRowsData as PurchaseOrderNewFragment[]
          );
      },
    [handleSelectPurchaseOrders]
  );

  return (
    <Box
      data-cy={dataCy}
      display="flex"
      flexDirection="column"
      className="purchase-orders-data-grid"
    >
      {!!selectedPurchaseOrderId && (
        <BankPurchaseOrderDrawer
          purchaseOrderId={selectedPurchaseOrderId}
          isBankUser={isBankUser}
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
