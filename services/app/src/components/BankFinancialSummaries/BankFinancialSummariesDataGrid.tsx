import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import {
  GetLatestBankFinancialSummariesSubscription,
  ProductTypeEnum,
} from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  bankFinancialSummaries: GetLatestBankFinancialSummariesSubscription["bank_financial_summaries"];
}

export default function BankFinancialSummariesDataGrid({
  bankFinancialSummaries,
}: Props) {
  const rows = bankFinancialSummaries;
  const columns = useMemo(
    () => [
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.Type,
        cellRender: (params: ValueFormatterParams) =>
          ProductTypeToLabel[params.row.data.product_type as ProductTypeEnum],
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Outstanding Principal",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_principal}
          />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Accrued Interest",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "total_outstanding_fees",
        caption: "Accrued Late Fees",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_fees}
          />
        ),
      },
      {
        dataField: "total_principal_in_requested_state",
        caption: "Principal in Requested State",
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
        dataField: "adjusted_total_limit",
        caption: "Total Limit",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.adjusted_total_limit} />
        ),
      },
    ],
    []
  );

  return (
    <ControlledDataGrid isExcelExport dataSource={rows} columns={columns} />
  );
}
