import { GridValueFormatterParams } from "@material-ui/data-grid";
import CompanyLicenseDrawerLauncher from "components/CompanyLicenses/CompanyLicenseDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import { CompanyLicenseFragment, CompanyLicenses } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(companyLicenses: CompanyLicenseFragment[]) {
  return companyLicenses.map((companyLicense) => {
    return {
      ...companyLicense,
      is_file_attached: !!companyLicense.file_id,
      is_underwriting_enabled: !!companyLicense.is_underwriting_enabled,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  isUnderwritingInfoVisible?: boolean;
  companyLicenses: CompanyLicenseFragment[];
  selectedCompanyLicensesIds?: CompanyLicenses["id"][];
  handleSelectCompanyLicenses?: (
    CompanyLicenses: CompanyLicenseFragment[]
  ) => void;
}

export default function CompanyLicensesDataGrid({
  isExcelExport = true,
  isUnderwritingInfoVisible = false,
  companyLicenses,
  selectedCompanyLicensesIds,
  handleSelectCompanyLicenses,
}: Props) {
  const rows = getRows(companyLicenses);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "License Number",
        dataField: "license_number",
        width: ColumnWidths.License,
        cellRender: (params: GridValueFormatterParams) => (
          <CompanyLicenseDrawerLauncher
            label={params.row.data.license_number}
            companyLicense={params.row.data as CompanyLicenseFragment}
          />
        ),
      },
      {
        fixed: true,
        dataField: "us_state",
        caption: "US State",
        width: ColumnWidths.UsState,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell
            label={params.row.data.us_state ? params.row.data.us_state : "-"}
          />
        ),
      },
      {
        visible: isUnderwritingInfoVisible,
        caption: "Facility Name",
        dataField: "facility_name",
        width: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell
            label={
              params.row.data.company_facility?.name
                ? params.row.data.company_facility.name
                : "-"
            }
          />
        ),
      },
      {
        visible: isUnderwritingInfoVisible,
        caption: "UW Enabled?",
        dataField: "is_underwriting_enabled",
        width: ColumnWidths.MinWidth,
      },
      {
        dataField: "license_category",
        caption: "License Category",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell
            label={
              params.row.data.license_category
                ? params.row.data.license_category
                : "-"
            }
          />
        ),
      },
      {
        dataField: "license_description",
        caption: "License Description",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell
            label={
              params.row.data.license_description
                ? params.row.data.license_description
                : "-"
            }
          />
        ),
      },
      {
        dataField: "license_status",
        caption: "License Status",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell
            label={
              params.row.data.license_status
                ? params.row.data.license_status
                : "-"
            }
          />
        ),
      },
      {
        caption: "Expiration Date",
        dataField: "expiration_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.expiration_date} />
        ),
      },
      {
        caption: "Legal Name",
        dataField: "legal_name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell
            label={
              params.row.data.legal_name ? params.row.data.legal_name : "-"
            }
          />
        ),
      },
      {
        caption: "File Attachment?",
        dataField: "is_file_attached",
        minWidth: ColumnWidths.MinWidth,
      },
    ],
    [isUnderwritingInfoVisible]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        !!handleSelectCompanyLicenses &&
        handleSelectCompanyLicenses(
          selectedRowsData as CompanyLicenseFragment[]
        ),
    [handleSelectCompanyLicenses]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={!!handleSelectCompanyLicenses}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompanyLicensesIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
