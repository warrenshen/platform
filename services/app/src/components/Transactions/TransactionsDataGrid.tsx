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
  isMiniTable: Boolean;
}

function TransactionsDataGrid({ transactions, isMiniTable }: Props) {
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
      visible: !isMiniTable,
      width: 140,
      cellRender: companyNameRenderer,
    },
    {
      dataField: "type",
      visible: !isMiniTable,
      caption: "Type",
      width: 140,
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
      caption: "To Principal",
      alignment: "right",
      visible: !isMiniTable,
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.to_principal} />
      ),
    },
    {
      caption: "To Interest",
      alignment: "right",
      visible: !isMiniTable,
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.to_interest} />
      ),
    },
    {
      caption: "To Fees",
      alignment: "right",
      visible: !isMiniTable,
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.to_fees} />
      ),
    },
  ];

  return (
    <DataGrid height={"100%"} width={"100%"} dataSource={rows}>
      {columns.map(
        ({ dataField, caption, width, alignment, visible, cellRender }) => (
          <Column
            key={caption}
            caption={caption}
            dataField={dataField}
            width={width}
            alignment={alignment}
            cellRender={cellRender}
            visible={visible}
          />
        )
      )}
      <Paging pageSize={30} />
      <Pager visible allowedPageSizes={[30]} />
    </DataGrid>
  );
}

export default TransactionsDataGrid;
