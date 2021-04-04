import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { GetFinancialSummariesByCompanyIdQuery } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  financialSummaries: GetFinancialSummariesByCompanyIdQuery["financial_summaries"];
  isExcelExport?: boolean;
}

function FinancialSummariesDataGrid({
  financialSummaries,
  isExcelExport = false,
}: Props) {
  const rows = financialSummaries;
  const columns = useMemo(
    () => [
      {
        dataField: "date",
        caption: "Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.date} />
        ),
      },
      {
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            <Box>{(params.row.data.company?.name || "-") as string}</Box>
          </Box>
        ),
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Principal Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_principal}
          />
        ),
      },
      {
        dataField: "total_outstanding_principal_for_interest",
        caption: "Interest Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_principal_for_interest}
          />
        ),
      },
      {
        dataField: "interest_accrued_today",
        caption: "Interest Accrued Today",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.interest_accrued_today}
          />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "total_outstanding_fees",
        caption: "Outstanding Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_fees}
          />
        ),
      },
      {
        dataField: "total_principal_in_requested_state",
        caption: "Requested Principal Balance",
        width: ColumnWidths.Currency,
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
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.available_limit} />
        ),
      },
      {
        dataField: "adjusted_total_limit",
        caption: "Total Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.adjusted_total_limit} />
        ),
      },
    ],
    []
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        isSortingDisabled
        dataSource={rows}
        columns={columns}
        isExcelExport={isExcelExport}
      />
    </Box>
  );
}

export default FinancialSummariesDataGrid;
