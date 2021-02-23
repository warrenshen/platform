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
import { PaymentFragment } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { truncateUuid } from "lib/uuid";
import { useState } from "react";

interface Props {
  payments: PaymentFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
  actionItems?: DataGridActionItem[];
}

function PaymentsDataGrid({
  payments,
  customerSearchQuery,
  onClickCustomerName,
  actionItems = [],
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = payments;

  const companyNameRenderer = (params: ValueFormatterParams) => {
    return (
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
    );
  };

  const columns = [
    {
      dataField: "id",
      caption: "Payment ID",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <Box>{truncateUuid(params.row.data.id as string)}</Box>
      ),
    },
    {
      visible: actionItems.length > 0,
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
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      caption: "Company",
      width: 200,
      cellRender: companyNameRenderer,
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
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DatetimeDataGridCell datetimeString={params.row.data.submitted_at} />
      ),
    },
    {
      caption: "Requested Payment Date",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.requested_payment_date} />
      ),
    },
    {
      caption: "Payment Date",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.payment_date} />
      ),
    },
    {
      caption: "Settlement Date",
      width: 140,
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
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        dataSource={rows}
        columns={columns}
        pageSize={30}
        allowedPageSizes={[30]}
        ref={(ref) => setDataGrid(ref)}
      />
    </Box>
  );
}

export default PaymentsDataGrid;
