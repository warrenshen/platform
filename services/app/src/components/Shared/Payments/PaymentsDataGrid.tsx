import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { DatetimeDataGridCell } from "components/Shared/DataGrid/DateDataGridCell";
import { PaymentFragment } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { truncateUuid } from "lib/uuid";
import { useState } from "react";

interface Props {
  payments: PaymentFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
}

function PaymentsDataGrid({
  payments,
  customerSearchQuery,
  onClickCustomerName,
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
      caption: "Submitted At",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DatetimeDataGridCell datetimeString={params.row.data.submitted_at} />
      ),
    },
    {
      dataField: "submitted_by_user.full_name",
      caption: "Submitted By",
      width: 140,
    },
    {
      dataField: "settled_at",
      caption: "Settled At",
      width: 140,
    },
    {
      dataField: "effective_date",
      caption: "Effective Date",
      width: 140,
    },
    {
      dataField: "deposit_date",
      caption: "Deposit Date",
      width: 140,
    },
    {
      caption: "Applied At",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DatetimeDataGridCell datetimeString={params.row.data.applied_at} />
      ),
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
