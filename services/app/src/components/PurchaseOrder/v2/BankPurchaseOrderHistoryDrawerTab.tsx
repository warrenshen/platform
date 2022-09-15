import { Box, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import PurchaseOrderStatusChip from "components/Shared/Chip/PurchaseOrderStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { PurchaseOrderFragment } from "generated/graphql";
import {
  NewPurchaseOrderStatus,
  NewPurchaseOrderStatusToLabel,
} from "lib/enum";
import { ColumnWidths } from "lib/tables";

interface Props {
  purchaseOrder: PurchaseOrderFragment;
}

const getRows = (history: any[]): RowsProp => {
  return history
    .map((event) => ({
      ...event,
      date_time: new Date(event.date_time),
    }))
    .reverse();
};

const columns = [
  {
    caption: "Datetime",
    dataField: "date_time",
    width: ColumnWidths.Datetime,
    alignment: "center",
    format: "MM/dd/yyyy hh:mm:ss a",
  },
  {
    caption: "Action",
    dataField: "action",
    width: ColumnWidths.Comment,
  },
  {
    caption: "Status After Action",
    dataField: "new_purchase_order_status",
    width: ColumnWidths.StatusChip,
    alignment: "left",
    cellRender: (params: ValueFormatterParams) => {
      return (
        <PurchaseOrderStatusChip
          purchaseOrderStatus={
            params.row.data.new_purchase_order_status as NewPurchaseOrderStatus
          }
        />
      );
    },
    lookup: {
      dataSource: {
        store: {
          type: "array",
          data: Object.values(NewPurchaseOrderStatus).map(
            (purchaseOrderStatus) => ({
              new_purchase_order_status: purchaseOrderStatus,
              label: NewPurchaseOrderStatusToLabel[purchaseOrderStatus],
            })
          ),
        },
        key: "new_purchase_order_status",
      },
      valueExpr: "new_purchase_order_status",
      displayExpr: "label",
    },
  },
  {
    caption: "Created By",
    dataField: "created_by_user_full_name",
    width: ColumnWidths.UserName,
    alignment: "center",
  },
];

const BankPurchaseOrderHistoryDrawerTab = ({ purchaseOrder }: Props) => {
  const { history } = purchaseOrder;

  return (
    <Box>
      <Box m={4} />
      <Typography variant="h6">History</Typography>
      <Box m={2} />
      <ControlledDataGrid
        dataSource={getRows(history)}
        columns={columns}
        filtering={{ enable: true }}
        isExcelExport
      />
    </Box>
  );
};

export default BankPurchaseOrderHistoryDrawerTab;
