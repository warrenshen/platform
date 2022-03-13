import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import CompanyLicenseDrawerLauncher from "components/CompanyLicenses/CompanyLicenseDrawerLauncher";
import { CompanyLicenseFragment } from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(companyLicenses: CompanyLicenseFragment[]): RowsProp {
  return companyLicenses.map((companyLicense) => {
    return {
      ...companyLicense,
      is_underwriting_enabled: !!companyLicense.is_underwriting_enabled,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  isUnderwritingInfoVisible?: boolean;
  companyLicenses: CompanyLicenseFragment[];
}

export default function CompanyLicensesDataGrid({
  isExcelExport = true,
  isUnderwritingInfoVisible = false,
  companyLicenses,
}: Props) {
  const rows = getRows(companyLicenses);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "License Number",
        dataField: "license_number",
        width: ColumnWidths.License,
        cellRender: (params: ValueFormatterParams) => (
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
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell
            label={params.row.data.us_state ? params.row.data.us_state : "-"}
          />
        ),
      },
      {
        isVisible: isUnderwritingInfoVisible,
        caption: "Facility Name",
        dataField: "facility_name",
        width: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
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
        isVisible: isUnderwritingInfoVisible,
        caption: "UW Enabled?",
        dataField: "is_underwriting_enabled",
        width: ColumnWidths.MinWidth,
      },
      {
        dataField: "license_category",
        caption: "License Category",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
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
        cellRender: (params: ValueFormatterParams) => (
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
        cellRender: (params: ValueFormatterParams) => (
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
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.expiration_date} />
        ),
      },
      {
        caption: "Legal Name",
        dataField: "legal_name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell
            label={
              params.row.data.legal_name ? params.row.data.legal_name : "-"
            }
          />
        ),
      },
      {
        caption: "File Attachment",
        dataField: "file_id",
        width: ColumnWidths.FileAttachment,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DownloadThumbnail
            isCountVisible={false}
            fileIds={[params.row.data.file_id]}
            fileType={FileTypeEnum.COMPANY_LICENSE}
          />
        ),
      },
    ],
    [isUnderwritingInfoVisible]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      dataSource={rows}
      columns={columns}
    />
  );
}
