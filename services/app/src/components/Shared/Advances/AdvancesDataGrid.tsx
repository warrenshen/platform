import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { DatetimeDataGridCell } from "components/Shared/DataGrid/DateDataGridCell";
import { PaymentFragment } from "generated/graphql";
import { useState } from "react";

function getRows(payments: PaymentFragment[]): RowsProp {
  return payments.map((item) => {
    return {
      ...item,
    };
  });
}

interface Props {
  payments: PaymentFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
}

function AdvancesDataGrid({
  payments,
  customerSearchQuery,
  onClickCustomerName,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(payments);

  window.console.log(rows);

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
      caption: "Advance ID",
      width: 140,
    },
    {
      caption: "Company",
      width: 140,
      cellRender: companyNameRenderer,
    },
    {
      caption: "Amount",
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.amount}
        ></CurrencyDataGridCell>
      ),
    },
    {
      dataField: "method",
      caption: "Method",
      width: 90,
    },
    {
      caption: "Submitted At",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DatetimeDataGridCell
          datetimeString={params.row.data.submitted_at}
        ></DatetimeDataGridCell>
      ),
    },
    {
      dataField: "deposit_date",
      caption: "Deposit Date",
      width: 140,
    },
  ];

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      pager
      pageSize={30}
      allowedPageSizes={[30]}
      ref={(ref) => setDataGrid(ref)}
    ></ControlledDataGrid>
  );
}

export default AdvancesDataGrid;
