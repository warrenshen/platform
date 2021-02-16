import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { LoanFragment, LoanStatusEnum } from "generated/graphql";
import { truncateUuid } from "lib/uuid";
import { useEffect, useState } from "react";

interface Props {
  isStatusVisible: boolean;
  loans: LoanFragment[];
  customerSearchQuery?: string;
}

// TODO (warrenshen): merge this component with the other LoansDataGrid
// component to create a reusable component?
function LoansDataGrid({
  isStatusVisible,
  loans,
  customerSearchQuery = "",
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
      cellRender: (params: ValueFormatterParams) => (
        <Box>{truncateUuid(params.value as string)}</Box>
      ),
    },
    ...(isStatusVisible
      ? [
          {
            dataField: "status",
            caption: "Status",
            width: 120,
            alignment: "center",
            cellRender: (params: ValueFormatterParams) => (
              <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
            ),
          },
        ]
      : []),
    // {
    //   dataField: "purchase_order.order_number",
    //   caption: "Order Number",
    //   width: 120,
    // },
    {
      caption: "Maturity Date",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.maturity_date} />
      ),
    },
    {
      caption: "Loan Amount",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      dataField: "outstanding_principal_balance",
      caption: "Outstanding Principal",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.outstanding_principal_balance}
        />
      ),
    },
    {
      dataField: "outstanding_interest",
      caption: "Outstanding Interest",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
      ),
    },
    {
      dataField: "outstanding_fees",
      caption: "Outstanding Fees",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
      ),
    },
  ];

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
    />
  );
}

export default LoansDataGrid;
