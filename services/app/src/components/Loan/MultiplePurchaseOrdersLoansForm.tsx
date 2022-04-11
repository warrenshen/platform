import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DateInput from "components/Shared/FormInputs/DateInput";
import { formatCurrency } from "lib/number";
import { PurchaseOrderLoanUpsert } from "lib/finance/loans/purchaseOrders";
import { ColumnWidths } from "lib/tables";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  setPaymentDate: (date: string | null) => void;
  paymentDate: string | null;
  purchaseOrderLoans: PurchaseOrderLoanUpsert[];
  loanTotal: number;
  balanceRemaining: number;
}

const columns = [
  {
    dataField: "vendor_name",
    caption: "Vendor Name",
    minWidth: ColumnWidths.MinWidth,
    cellRender: (params: ValueFormatterParams) => (
      <span>{params.row.data.artifact.vendor.name}</span>
    ),
  },
  {
    dataField: "order_number",
    caption: "PO Number",
    minWidth: ColumnWidths.Type,
    cellRender: (params: ValueFormatterParams) => (
      <span>{params.row.data.artifact.order_number}</span>
    ),
  },
  {
    caption: "PO Amount",
    width: ColumnWidths.Currency,
    alignment: "right",
    cellRender: (params: ValueFormatterParams) => (
      <CurrencyDataGridCell value={params.row.data.artifact.amount} />
    ),
  },
  {
    caption: "Loan Amount",
    width: ColumnWidths.Currency,
    alignment: "right",
    cellRender: (params: ValueFormatterParams) => (
      <CurrencyDataGridCell value={params.row.data.loan.amount} />
    ),
  },
  {
    caption: "PO Date",
    width: ColumnWidths.Date,
    alignment: "center",
    cellRender: (params: ValueFormatterParams) => (
      <DateDataGridCell dateString={params.row.data.artifact.order_date} />
    ),
  },
];

export default function MultiplePurchaseOrdersLoansForm({
  setPaymentDate,
  paymentDate,
  purchaseOrderLoans,
  loanTotal,
  balanceRemaining,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <ControlledDataGrid
          dataSource={purchaseOrderLoans.map((p) => ({
            ...p,
            id: p.artifact.id,
          }))}
          columns={columns}
        />
      </Box>
      <Box>
        <p>
          These {purchaseOrderLoans.length} loans total to{" "}
          <strong>{formatCurrency(loanTotal)}</strong>.
        </p>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <DateInput
          className={classes.inputField}
          id="requested-payment-date-date-picker"
          label="Requested Payment Date"
          disablePast
          disableNonBankDays
          value={paymentDate}
          onChange={(value) => setPaymentDate(value)}
        />
      </Box>
    </Box>
  );
}
