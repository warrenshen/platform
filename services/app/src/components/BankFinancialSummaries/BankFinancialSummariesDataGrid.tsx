import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { GetLatestBankFinancialSummariesQuery } from "generated/graphql";

interface Props {
  bankFinancialSummaries: GetLatestBankFinancialSummariesQuery["bank_financial_summaries"];
  actionItems?: DataGridActionItem[];
}

function BankFinancialSummariesDataGrid({
  bankFinancialSummaries,
  actionItems = [],
}: Props) {
  const rows = bankFinancialSummaries;

  const columns = [
    {
      dataField: "date",
      caption: "Date",
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.date} />
      ),
    },
    {
      dataField: "product_type",
      caption: "Product Type",
    },
    {
      dataField: "total_outstanding_principal",
      caption: "Total Outstanding Principal",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.total_outstanding_principal}
        />
      ),
    },
    {
      dataField: "total_outstanding_interest",
      caption: "Total Outstanding Interest",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.total_outstanding_interest}
        />
      ),
    },
    {
      dataField: "total_outstanding_fees",
      caption: "Total Outstanding Fees",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.total_outstanding_fees} />
      ),
    },
    {
      dataField: "total_principal_in_requested_state",
      caption: "Total Principal in Requested State",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.total_principal_in_requested_state}
        />
      ),
    },
    {
      dataField: "available_limit",
      caption: "Available Limit",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.available_limit} />
      ),
    },
    {
      dataField: "total_limit",
      caption: "Total Limit",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.total_limit} />
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        isSortingDisabled
        dataSource={rows}
        columns={columns}
      />
    </Box>
  );
}

export default BankFinancialSummariesDataGrid;
