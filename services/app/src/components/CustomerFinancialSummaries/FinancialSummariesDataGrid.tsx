import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  FinancialSummaryFragment,
  GetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  financialSummaries: GetFinancialSummariesByCompanyIdQuery["financial_summaries"];
}

function FinancialSummariesDataGrid({
  isExcelExport = false,
  financialSummaries,
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
        caption: "Outstanding Late Fees",
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
      {
        dataField: "minimum_monthly_payload.duration",
        caption: "Minimum Interest Duration",
        width: ColumnWidths.Currency,
        calculateCellValue: ({
          minimum_monthly_payload: minimumMonthlyPayload,
        }: FinancialSummaryFragment) => minimumMonthlyPayload?.duration || "-",
      },
      {
        dataField: "minimum_monthly_payload.amount",
        caption: "Minimum Interest Value",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => {
          const minimumMonthlyPayload = params.row.data.minimum_monthly_payload;
          const value = !!minimumMonthlyPayload
            ? minimumMonthlyPayload.minimum_amount !== null
              ? minimumMonthlyPayload.minimum_amount
              : null
            : null;
          return <CurrencyDataGridCell value={value} />;
        },
      },
      {
        dataField: "minimum_monthly_payload.amount_short",
        caption: "Minimum Interest Remaining",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => {
          const minimumMonthlyPayload = params.row.data.minimum_monthly_payload;
          const value = !!minimumMonthlyPayload
            ? minimumMonthlyPayload.amount_short !== null
              ? minimumMonthlyPayload.amount_short
              : null
            : null;
          return <CurrencyDataGridCell value={value} />;
        },
      },
    ],
    []
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        isExcelExport={isExcelExport}
        isSortingDisabled
        dataSource={rows}
        columns={columns}
      />
    </Box>
  );
}

export default FinancialSummariesDataGrid;
