import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  FinancialSummaryFragment,
  GetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(financialSummaries: FinancialSummaryFragment[]): RowsProp {
  return financialSummaries.map((financialSummary) => {
    return {
      ...financialSummary,
      product_type:
        ProductTypeToLabel[financialSummary.product_type as ProductTypeEnum],
    };
  });
}

interface Props {
  isCustomerNameFixed?: boolean;
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isProductTypeVisible?: boolean;
  isSortingDisabled?: boolean;
  financialSummaries: GetFinancialSummariesByCompanyIdQuery["financial_summaries"];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
}

export default function FinancialSummariesDataGrid({
  isCustomerNameFixed = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isProductTypeVisible = false,
  isSortingDisabled = true,
  financialSummaries,
  handleClickCustomer,
}: Props) {
  const rows = getRows(financialSummaries);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "date",
        caption: "Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.date} />
        ),
      },
      {
        fixed: isCustomerNameFixed,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company.name}
              onClick={() => handleClickCustomer(params.row.data.company.id)}
            />
          ) : (
            params.row.data.company?.name || "-"
          ),
      },
      {
        visible: isProductTypeVisible,
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Principal Balance (PB)",
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
        caption: "PB Including Clearance Days",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_principal_for_interest}
          />
        ),
      },
      {
        dataField: "total_amount_to_pay_interest_on",
        caption: "Amount To Pay Interest On",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_amount_to_pay_interest_on}
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
    [isCustomerNameFixed, isProductTypeVisible, handleClickCustomer]
  );

  const filtering = useMemo(() => ({ enable: isFilteringEnabled }), [
    isFilteringEnabled,
  ]);

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={filtering}
      dataSource={rows}
      columns={columns}
    />
  );
}
