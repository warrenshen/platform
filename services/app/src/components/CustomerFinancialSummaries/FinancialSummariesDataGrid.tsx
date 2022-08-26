import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import DebtFacilityCompanyStatusChip from "components/Shared/Chip/DebtFacilityCompanyStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  FinancialSummaryFragment,
  GetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { CurrencyPrecision, PercentPrecision } from "lib/number";
import { formatRowModel } from "lib/tables";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(financialSummaries: FinancialSummaryFragment[]): RowsProp {
  return financialSummaries.map((financialSummary) => {
    console.log(financialSummary);
    return formatRowModel({
      ...financialSummary,
      adjusted_total_limit: financialSummary.adjusted_total_limit,
      available_limit: financialSummary.available_limit,
      daily_interest_rate: financialSummary.daily_interest_rate,
      date: !!financialSummary.date
        ? parseDateStringServer(financialSummary.date)
        : null,
      holding_account_balance:
        !!financialSummary?.account_level_balance_payload.hasOwnProperty(
          "credits_total"
        )
          ? financialSummary.account_level_balance_payload["credits_total"]
          : null,
      interest_accrued_today: financialSummary.interest_accrued_today,
      late_fees_accrued_today: financialSummary.late_fees_accrued_today,
      minimum_interest_amount: financialSummary.minimum_interest_amount,
      minimum_interest_amount_display:
        !!financialSummary?.minimum_interest_amount
          ? financialSummary.minimum_interest_amount
          : null,
      minimum_interest_duration: financialSummary.minimum_interest_duration,
      minimum_interest_remaining: financialSummary.minimum_interest_remaining,
      minimum_interest_remaining_display:
        !!financialSummary?.minimum_interest_remaining
          ? financialSummary.minimum_interest_amount
          : null,
      product_type:
        ProductTypeToLabel[financialSummary.product_type as ProductTypeEnum],
      total_amount_to_pay_interest_on:
        financialSummary.total_amount_to_pay_interest_on,
      total_outstanding_account_fees:
        financialSummary?.account_level_balance_payload?.fees_total,
      total_outstanding_interest: financialSummary.total_outstanding_interest,
      total_outstanding_late_fees: financialSummary.total_outstanding_fees,
      total_outstanding_principal: financialSummary.total_outstanding_principal,
      total_outstanding_principal_for_interest:
        financialSummary.total_outstanding_principal_for_interest,
      total_outstanding_principal_past_due:
        financialSummary.total_outstanding_principal_past_due,
      total_outstanding_principal_percentage_past_due:
        !!financialSummary.total_outstanding_principal &&
        financialSummary.total_outstanding_principal > 0
          ? financialSummary.total_outstanding_principal_past_due /
            financialSummary.total_outstanding_principal
          : 0,
    });
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
        format: "shortDate",
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
        dataField: "company.debt_facility_status",
        caption: "Debt Facility Status",
        width: ColumnWidths.ProductType,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(DebtFacilityCompanyStatusEnum).map(
                (debtFacilityStatus) => ({
                  debt_facility_status: debtFacilityStatus,
                  label: DebtFacilityCompanyStatusToLabel[debtFacilityStatus],
                })
              ),
              key: "debt_facility_status",
            },
          },
          valueExpr: "debt_facility_status",
          displayExpr: "label",
        },
        cellRender: (params: ValueFormatterParams) => (
          <DebtFacilityCompanyStatusChip
            debtFacilityCompanyStatus={
              params.row.data.company.debt_facility_status
            }
          />
        ),
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Principal Balance (PB)",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Outstanding Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_late_fees",
        caption: "Outstanding Late Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_account_fees",
        caption: "Outstanding Account Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_for_interest",
        caption: "PB Including Clearance Days",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_amount_to_pay_interest_on",
        caption: "Amount To Pay Interest On",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "daily_interest_rate",
        caption: "Daily Interest Rate",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "interest_accrued_today",
        caption: "Interest Accrued Today",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "late_fees_accrued_today",
        caption: "Late Fees Accrued Today",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_past_due",
        caption: "Outstanding Principal Past Due",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_percentage_past_due",
        caption: "Outstanding Principal % Past Due",
        format: {
          type: "percent",
          precision: PercentPrecision,
        },
        minWidth: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "available_limit",
        caption: "Available Limit",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "adjusted_total_limit",
        caption: "Total Limit",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "minimum_interest_duration",
        caption: "Minimum Interest Duration",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "minimum_interest_amount",
        caption: "Minimum Interest Amount",
        calculateDisplayValue: "minimum_interest_amount_display",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "minimum_interest_remaining",
        caption: "Minimum Interest Remaining",
        calculateDisplayValue: "minimum_interest_remaining_display",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "holding_account_balance",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Holding Account Balance",
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
