import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import DataGrid, { Column, IColumnProps } from "devextreme-react/data-grid";
import { LoanFragment } from "generated/graphql";
import { useEffect, useState } from "react";

function getRows(loans: LoanFragment[]): RowsProp {
  return loans.map((item) => ({
    ...item,
  }));
}

interface Props {
  loans: LoanFragment[];
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
}

// TODO (warrenshen): merge this component with the other LoansDataGrid
// component to create a reusable component?
function LoansDataGrid({
  loans,
  customerSearchQuery,
  onClickCustomerName,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(loans);

  useEffect(() => {
    if (!dataGrid) return;
    if (customerSearchQuery) {
      dataGrid.instance.filter([
        "purchase_order.company.name",
        "contains",
        customerSearchQuery,
      ]);
    } else {
      dataGrid.instance.clearFilter();
    }
  }, [dataGrid, customerSearchQuery]);

  const statusCellRenderer = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const columns: IColumnProps[] = [
    {
      dataField: "id",
      caption: "ID",
      width: 120,
    },
    {
      dataField: "purchase_order.order_number",
      caption: "Order Number",
      width: 120,
    },
    {
      dataField: "requested_at",
      caption: "Requested At",
      width: 120,
    },
    {
      dataField: "amount",
      caption: "Loan Amount",
      width: 120,
    },
    {
      dataField: "status",
      caption: "Status",
      width: 120,
      alignment: "center",
      cellRender: statusCellRenderer,
    },
    {
      dataField: "outstanding_interest",
      caption: "Interest Accrued",
      alignment: "center",
      width: 120,
    },
    {
      dataField: "maturity_date",
      caption: "Maturity Date",
      alignment: "center",
      width: 120,
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
      {/* <Paging pageSize={fullView ? 30 : 5} />
      <Pager visible={fullView} allowedPageSizes={[5, 30]} /> */}
    </DataGrid>
  );
}

export default LoansDataGrid;
