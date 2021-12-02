import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import { CompanyLicenseFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { FileTypeEnum } from "lib/enum";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  companyLicenses: CompanyLicenseFragment[];
}

export default function CompanyLicensesDataGrid({
  isExcelExport = true,
  companyLicenses,
}: Props) {
  const rows = companyLicenses;
  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "License Number",
        dataField: "license_number",
        width: ColumnWidths.License,
      },
      {
        dataField: "us_state",
        caption: "US State",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Legal Name",
        dataField: "legal_name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "license_category",
        caption: "License Category",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "license_description",
        caption: "License Description",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "license_status",
        caption: "License Status",
        minWidth: ColumnWidths.MinWidth,
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
    []
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
