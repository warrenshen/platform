import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { TransactionFragment } from "generated/graphql";

interface Props {
  transactions: TransactionFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
}

function TransactionsDataGrid({ transactions, onClickCustomerName }: Props) {
  const rows = transactions;

  const companyNameRenderer = (params: ValueFormatterParams) => {
    const companyName = params.row.data.payment.company.name;
    return <ClickableDataGridCell label={companyName} onClick={() => {}} />;
  };

  const columns: IColumnProps[] = [
    {
      dataField: "id",
      caption: "Transaction ID",
      width: 140,
    },
    {
      dataField: "payment.id",
      caption: "Payment ID",
      width: 140,
    },
    {
      caption: "Company Name",
      width: 140,
      cellRender: companyNameRenderer,
    },
    {
      dataField: "type",
      caption: "Type",
      width: 140,
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
      caption: "To Principal",
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.to_principal}
        ></CurrencyDataGridCell>
      ),
    },
    {
      caption: "To Interest",
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.to_interest}
        ></CurrencyDataGridCell>
      ),
    },
    {
      caption: "To Fees",
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.to_fees}
        ></CurrencyDataGridCell>
      ),
    },
  ];

  return (
    <DataGrid height={"100%"} width={"100%"} dataSource={rows}>
      {columns.map(({ dataField, caption, width, alignment, cellRender }) => (
        <Column
          key={caption}
          caption={caption}
          dataField={dataField}
          width={width}
          alignment={alignment}
          cellRender={cellRender}
        />
      ))}
      <Paging pageSize={30} />
      <Pager visible allowedPageSizes={[30]} />
    </DataGrid>
  );
}

export default TransactionsDataGrid;
