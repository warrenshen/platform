import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { RecentMonthlyCalculationsFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  companies: RecentMonthlyCalculationsFragment[];
  selectedCompanyIds: RecentMonthlyCalculationsFragment["id"][];
  handleSelectCompanies: (
    companyIds: RecentMonthlyCalculationsFragment[]
  ) => void;
}

const getRows = (companies: RecentMonthlyCalculationsFragment[]) =>
  companies.map((company) => ({
    ...company,
    company_name: !!company.name ? company.name : "",
    last_run_date: !!company?.monthly_summary_calculations?.[0]?.report_month
      ? company.monthly_summary_calculations[0].report_month
      : "-",
  }));

export default function CompanyMonthlySummariesDataGrid({
  isExcelExport = true,
  isMultiSelectEnabled = false,
  companies,
  selectedCompanyIds,
  handleSelectCompanies,
}: Props) {
  const rows = useMemo(() => getRows(companies), [companies]);
  const columns = useMemo(
    () => [
      {
        dataField: "company_name",
        caption: "Company Name",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "last_run_date",
        caption: "Last Run Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        format: "shortDate",
      },
    ],
    []
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectCompanies &&
        handleSelectCompanies(
          selectedRowsData as RecentMonthlyCalculationsFragment[]
        ),
    [handleSelectCompanies]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompanyIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
