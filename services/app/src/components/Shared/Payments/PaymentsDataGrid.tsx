import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
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

function PaymentsDataGrid({
  payments,
  customerSearchQuery,
  onClickCustomerName,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(payments);

  const renderAmount = (params: ValueFormatterParams) => (
    <CurrencyDataGridCell value={params.row.data.amount}></CurrencyDataGridCell>
  );

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

  const columns: IColumnProps[] = [
    {
      dataField: "id",
      caption: "Payment ID",
      width: 140,
    },
    {
      caption: "Amount",
      alignment: "right",
      width: 140,
      cellRender: renderAmount,
    },
    {
      dataField: "type",
      caption: "Type",
      width: 140,
    },
    {
      caption: "Company",
      width: 140,
      cellRender: companyNameRenderer,
    },
    {
      dataField: "method",
      caption: "Method",
      width: 140,
    },
    {
      dataField: "submitted_at",
      caption: "Submitted At",
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
      dataField: "applied_at",
      caption: "Applied At",
      width: 140,
    },
  ];

  return (
    <DataGrid
      height={"100%"}
      width={"100%"}
      dataSource={rows}
      ref={(ref) => setDataGrid(ref)}
    >
      {columns.map(
        ({ dataField, caption, width, alignment, cellRender }, i) => (
          <Column
            key={`${dataField}-${i}`}
            caption={caption}
            dataField={dataField}
            width={width}
            alignment={alignment}
            cellRender={cellRender}
          />
        )
      )}
      <Paging pageSize={30} />
      <Pager visible allowedPageSizes={[30]} />
    </DataGrid>
  );
}

export default PaymentsDataGrid;
