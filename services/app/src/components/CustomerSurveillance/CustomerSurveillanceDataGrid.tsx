import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CustomerSurveillanceStatusChip from "components/CustomerSurveillance/CustomerSurveillanceStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import {
  CustomerSurveillanceFragment,
  FinancialSummaries,
  GetCustomersCurrentSurveillanceSubscription,
} from "generated/graphql";
import { formatDateString, formatDatetimeString } from "lib/date";
import {
  FeatureFlagEnum,
  ProductTypeEnum,
  ProductTypeToLabel,
  QualifyForEnum,
  QualifyForToLabel,
  ReportingRequirementsCategoryEnum,
} from "lib/enum";
import { formatCurrency, formatPercentage } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isFinancialReportDateVisible?: boolean;
  isBorrowingBaseDateVisible?: boolean;
  isLoansReadyForAdvancesAmountVisible?: boolean;
  customers: GetCustomersCurrentSurveillanceSubscription["customers"];
  selectedCompaniesIds?: CustomerSurveillanceFragment["id"][];
  handleSelectCompanies?: (companies: CustomerSurveillanceFragment[]) => void;
}

const calculatePercentagePastDue = (financialSummary: FinancialSummaries) =>
  financialSummary && !!financialSummary.total_outstanding_principal
    ? formatPercentage(
        (financialSummary.total_outstanding_principal_past_due || 0.0) /
          financialSummary.total_outstanding_principal
      )
    : "0%";

function getRows(
  companies: GetCustomersCurrentSurveillanceSubscription["customers"]
): RowsProp {
  return companies.map((company) => {
    const productType = company?.most_recent_financial_summary?.[0]
      ? ProductTypeToLabel[
          company.most_recent_financial_summary[0]
            .product_type as ProductTypeEnum
        ]
      : "None";

    return formatRowModel({
      ...company,
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      financial_report_date: !!company?.most_recent_financial_report?.[0]
        ? formatDateString(
            company.most_recent_financial_report[0].application_date
          )
        : "-",
      financial_report_valid_until: !!company?.most_recent_financial_report?.[0]
        ? formatDatetimeString(
            company.most_recent_financial_report[0].expires_at,
            false
          )
        : "-",
      borrowing_base_date: !!company?.most_recent_borrowing_base?.[0]
        ? formatDateString(
            company.most_recent_borrowing_base[0].application_date
          )
        : "-",
      borrowing_base_valid_until: !!company?.most_recent_borrowing_base?.[0]
        ? formatDatetimeString(
            company.most_recent_borrowing_base[0].expires_at,
            false
          )
        : "-",
      qualify_for:
        QualifyForToLabel[
          company?.target_surveillance_result?.[0]
            ?.qualifying_product as QualifyForEnum
        ] || "-",
      selected_month_surveillance_status: !!company
        ?.target_surveillance_result?.[0]
        ? company.target_surveillance_result[0].surveillance_status
        : null,
      product_type: productType,
      debt_facility_status: company?.debt_facility_status
        ? company.debt_facility_status
        : null,
      percentage_past_due: !!company?.most_recent_financial_summary?.[0]
        ? calculatePercentagePastDue(
            company?.most_recent_financial_summary?.[0] as FinancialSummaries
          )
        : null,
      most_overdue_loan_days: !!company?.most_recent_financial_summary?.[0]
        ? company.most_recent_financial_summary[0].most_overdue_loan_days
        : null,
      loans_ready_for_advances_amount: formatCurrency(
        company?.loans.reduce((acc, { amount }) => acc + amount, 0),
        "$0"
      ),
    });
  });
}

export default function CustomerSurveillanceDataGrid({
  isExcelExport = true,
  isFinancialReportDateVisible = false,
  isBorrowingBaseDateVisible = false,
  isMultiSelectEnabled = false,
  isLoansReadyForAdvancesAmountVisible = false,
  customers,
  selectedCompaniesIds,
  handleSelectCompanies,
}: Props) {
  const rows = customers ? getRows(customers) : [];

  const columns = useMemo(
    () => [
      {
        dataField: "name",
        caption: "Customer Name",
        minWidth: ColumnWidths.Comment,
        alignment: "center",
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
          />
        ),
      },
      {
        dataField: "selected_month_surveillance_status",
        caption: "Surveillance Stage",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <CustomerSurveillanceStatusChip
            requestStatus={params.row.data.selected_month_surveillance_status}
          />
        ),
      },
      {
        dataField: "product_type",
        caption: "Current Product",
        alignment: "center",
        width: ColumnWidths.Status,
      },
      {
        dataField: "qualify_for",
        caption: "Qualifying for",
        width: ColumnWidths.Datetime,
        alignment: "center",
      },
      {
        visible: isFinancialReportDateVisible,
        dataField: "financial_report_date",
        caption: "Most Recent Financial Report",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.settings?.feature_flags_payload?.[
            FeatureFlagEnum.ReportingRequirementsCategory
          ] === ReportingRequirementsCategoryEnum.Four ? (
            <Box height={24} mb={0.5}>
              <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
            </Box>
          ) : (
            params.row.data.financial_report_date
          ),
      },
      {
        dataField: "financial_report_valid_until",
        caption: "Financial Report Valid Until",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.settings?.feature_flags_payload?.[
            FeatureFlagEnum.ReportingRequirementsCategory
          ] === ReportingRequirementsCategoryEnum.Four ? (
            <Box height={24} mb={0.5}>
              <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
            </Box>
          ) : (
            params.row.data.financial_report_valid_until
          ),
      },
      {
        visible: isBorrowingBaseDateVisible,
        dataField: "borrowing_base_date",
        caption: "Most Recent Borrowing Base",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        dataField: "borrowing_base_valid_until",
        caption: "Borrowing Base Valid Until",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        dataField: "percentage_past_due",
        caption: "% Past Due",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
      {
        dataField: "most_overdue_loan_days",
        caption: "Most Overdue Loan",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
      {
        visible: isLoansReadyForAdvancesAmountVisible,
        dataField: "loans_ready_for_advances_amount",
        caption: "Loans Ready For Advances Amount",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
    ],
    [
      isBorrowingBaseDateVisible,
      isFinancialReportDateVisible,
      isLoansReadyForAdvancesAmountVisible,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectCompanies && handleSelectCompanies(selectedRowsData),
    [handleSelectCompanies]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompaniesIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
