import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  FinancialSummaryFragment,
  GetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { formatCurrency, formatPercentage } from "lib/number";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(financialSummaries: FinancialSummaryFragment[]): RowsProp {
  return financialSummaries.map((financialSummary) => {
    return {
      ...financialSummary,
      product_type:
        ProductTypeToLabel[financialSummary.product_type as ProductTypeEnum],
      daily_interest_rate: formatPercentage(
        financialSummary.daily_interest_rate
      ),
      total_outstanding_principal: formatCurrency(
        financialSummary.total_outstanding_principal
      ),
      total_outstanding_interest: formatCurrency(
        financialSummary.total_outstanding_interest
      ),
      total_outstanding_late_fees: formatCurrency(
        financialSummary.total_outstanding_fees
      ),
      total_outstanding_account_fees: formatCurrency(
        financialSummary?.account_level_balance_payload?.fees_total
      ),
      total_outstanding_principal_for_interest: formatCurrency(
        financialSummary.total_outstanding_principal_for_interest
      ),
      total_amount_to_pay_interest_on: formatCurrency(
        financialSummary.total_amount_to_pay_interest_on
      ),
      interest_accrued_today: formatCurrency(
        financialSummary.interest_accrued_today
      ),
      late_fees_accrued_today: formatCurrency(
        financialSummary.late_fees_accrued_today
      ),
      total_outstanding_principal_past_due: formatCurrency(
        financialSummary.total_outstanding_principal_past_due
      ),
      total_outstanding_principal_percentage_past_due: formatPercentage(
        !!financialSummary.total_outstanding_principal &&
          financialSummary.total_outstanding_principal > 0
          ? financialSummary.total_outstanding_principal_past_due /
              financialSummary.total_outstanding_principal
          : 0
      ),
      available_limit: formatCurrency(financialSummary.available_limit),
      adjusted_total_limit: formatCurrency(
        financialSummary.adjusted_total_limit
      ),
      minimum_interest_duration: financialSummary.minimum_interest_duration,
      minimum_interest_amount: formatCurrency(
        financialSummary.minimum_interest_amount
      ),
      minimum_interest_remaining: formatCurrency(
        financialSummary.minimum_interest_remaining
      ),
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
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_late_fees",
        caption: "Outstanding Late Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_account_fees",
        caption: "Outstanding Account Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_for_interest",
        caption: "PB Including Clearance Days",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_amount_to_pay_interest_on",
        caption: "Amount To Pay Interest On",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "daily_interest_rate",
        caption: "Daily Interest Rate",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "interest_accrued_today",
        caption: "Interest Accrued Today",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "late_fees_accrued_today",
        caption: "Late Fees Accrued Today",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_past_due",
        caption: "Outstanding Principal Past Due",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_percentage_past_due",
        caption: "Outstanding Principal % Past Due",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "available_limit",
        caption: "Available Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "adjusted_total_limit",
        caption: "Total Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "minimum_interest_duration",
        caption: "Minimum Interest Duration",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "minimum_interest_amount",
        caption: "Minimum Interest Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "minimum_interest_remaining",
        caption: "Minimum Interest Remaining",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [isCustomerNameFixed, isProductTypeVisible, handleClickCustomer]
  );

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

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
