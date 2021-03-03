import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell, {
  DatetimeDataGridCell,
} from "components/Shared/DataGrid/DateDataGridCell";
import { PaymentFragment, Payments } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { truncateUuid } from "lib/uuid";
import { useMemo, useState } from "react";

interface Props {
  payments: PaymentFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
  actionItems?: DataGridActionItem[];
  enableSelect: boolean;
  selectedPaymentIds?: Payments["id"][];
  handleSelectPayments?: (payments: PaymentFragment[]) => void;
}

function PaymentsDataGrid({
  payments,
  customerSearchQuery,
  onClickCustomerName,
  actionItems,
  enableSelect,
  selectedPaymentIds,
  handleSelectPayments,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = payments;
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Payment ID",
        width: 140,
        cellRender: (params: ValueFormatterParams) => (
          <Box>{truncateUuid(params.row.data.id as string)}</Box>
        ),
      },
      {
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        minWidth: 100,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        caption: "Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        caption: "Company",
        width: 200,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            label={params.row.data.company.name}
            onClick={() => {
              onClickCustomerName(params.row.data.company.name);
              dataGrid?.instance.filter([
                "company.name",
                "=",
                params.row.data.company.name,
              ]);
            }}
          />
        ),
      },
      {
        dataField: "method",
        caption: "Method",
        width: 150,
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {PaymentMethodToLabel[params.row.data.method as PaymentMethodEnum]}
          </Box>
        ),
      },
      {
        caption: "Submitted Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell datetimeString={params.row.data.submitted_at} />
        ),
      },
      {
        caption: "Requested Payment Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        caption: "Payment Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.payment_date} />
        ),
      },
      {
        caption: "Settlement Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.settlement_date} />
        ),
      },
      {
        dataField: "submitted_by_user.full_name",
        caption: "Submitted By",
        width: 140,
      },
      {
        dataField: "settled_by_user.full_name",
        caption: "Settled By",
        width: 140,
      },
    ],
    [dataGrid?.instance, actionItems, onClickCustomerName]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectPayments &&
      handleSelectPayments(selectedRowsData as PaymentFragment[]),
    [handleSelectPayments]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        select={enableSelect}
        dataSource={rows}
        columns={columns}
        pageSize={30}
        allowedPageSizes={[30]}
        ref={(ref) => setDataGrid(ref)}
        selectedRowKeys={selectedPaymentIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </Box>
  );
}

export default PaymentsDataGrid;
