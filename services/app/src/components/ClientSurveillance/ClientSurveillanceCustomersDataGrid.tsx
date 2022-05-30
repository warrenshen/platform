import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  FinancialSummaries,
  GetNonDummyCustomersWithMetadataQuery,
} from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import {
  ClientSurveillanceCategoryEnum,
  ProductTypeEnum,
  ProductTypeToLabel,
  QualifyForEnum,
} from "lib/enum";
import { formatPercentage } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

import { QualifyForToLabel } from "../../lib/enum";
import ClientSurveillanceStatusChip from "./ClientSurveillanceStatusChip";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isFinancialReportDateVisible?: boolean;
  isBorrowingBaseDateVisible?: boolean;
  customers: GetNonDummyCustomersWithMetadataQuery["customers"];
  selectedCompaniesIds?: Companies["id"][];
  handleSelectCompanies?: (companies: Companies[]) => void;
}

const calculatePercentagePastDue = (financialSummary: FinancialSummaries) =>
  financialSummary && !!financialSummary.total_outstanding_principal
    ? formatPercentage(
        (financialSummary.total_outstanding_principal_past_due || 0.0) /
          financialSummary.total_outstanding_principal
      )
    : "0%";

function getRows(
  companies: GetNonDummyCustomersWithMetadataQuery["customers"]
): RowsProp {
  return companies.map((company) => {
    const productType =
      company?.financial_summaries && company.financial_summaries.length
        ? ProductTypeToLabel[
            company.financial_summaries[0].product_type as ProductTypeEnum
          ]
        : "None";

    const isLineOfCredit =
      productType === ProductTypeToLabel[ProductTypeEnum.LineOfCredit];

    const financialReport = !!company?.ebba_applications
      ? company?.ebba_applications.filter(
          ({ category }) =>
            category === ClientSurveillanceCategoryEnum.FinancialReport
        )[0]
      : null;

    const borrowingBase = !!company?.ebba_applications
      ? company?.ebba_applications.filter(
          ({ category }) =>
            category === ClientSurveillanceCategoryEnum.BorrowingBase
        )[0]
      : null;

    return {
      ...company,
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      financial_report_date: formatDatetimeString(
        financialReport?.application_date,
        false,
        "-"
      ),
      borrowing_base_date: isLineOfCredit
        ? formatDatetimeString(borrowingBase?.application_date, false, "-")
        : "N/A",
      qualify_for:
        QualifyForToLabel[
          company?.company_product_qualifications?.[0]
            ?.qualifying_product as QualifyForEnum
        ] || "-",
      product_type: productType,
      debt_facility_status: company?.debt_facility_status
        ? company.debt_facility_status
        : null,
      percentage_past_due: calculatePercentagePastDue(
        company?.financial_summaries?.[0] as FinancialSummaries
      ),
      most_overdue_loan_days: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].most_overdue_loan_days
        : null,
    };
  });
}

export default function ClientSurveillanceCustomersDataGrid({
  isExcelExport = true,
  isFinancialReportDateVisible = false,
  isBorrowingBaseDateVisible = false,
  isMultiSelectEnabled = false,
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
        dataField: "product_type",
        caption: "Current Product",
        alignment: "center",
        width: ColumnWidths.Status,
      },
      {
        dataField: "surveillance_status",
        caption: "Surveillance Stage",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <ClientSurveillanceStatusChip
            requestStatus={params.row.data.surveillance_status}
          />
        ),
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
      },
      {
        dataField: "financial_report_valid_until",
        caption: "Financial Report Valid Until",
        width: ColumnWidths.Date,
        alignment: "center",
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
    ],
    []
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
