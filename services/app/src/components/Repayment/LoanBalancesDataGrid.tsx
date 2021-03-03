import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { LoanBalance } from "lib/finance/payments/repayment";
import { useMemo } from "react";

interface Props {
  loanBalances: LoanBalance[];
}

function LoanBalancesDataGrid({ loanBalances }: Props) {
  const rows = loanBalances;
  const columns = useMemo(
    () => [
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
    ],
    []
  );

  return (
    <ControlledDataGrid isSortingDisabled dataSource={rows} columns={columns} />
  );
}

export default LoanBalancesDataGrid;
