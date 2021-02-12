import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { LoanFragment, LoanStatusEnum } from "generated/graphql";
import { useEffect, useState } from "react";

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
  const rows = loans;

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

  const columns = [
    {
      dataField: "id",
      caption: "ID",
      width: 120,
    },
    {
      dataField: "status",
      caption: "Status",
      width: 120,
      alignment: "center",
      cellRender: (params: ValueFormatterParams) => (
        <LoanStatusChip
          loanStatus={params.value as LoanStatusEnum}
        ></LoanStatusChip>
      ),
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
      caption: "Loan Amount",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.amount}
        ></CurrencyDataGridCell>
      ),
    },
    {
      dataField: "outstanding_interest",
      caption: "Interest Accrued",
      alignment: "center",
      width: 120,
    },
    {
      caption: "Maturity Date",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.maturity_date}
        ></DateDataGridCell>
      ),
    },
  ];

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
    ></ControlledDataGrid>
  );
}

export default LoansDataGrid;
