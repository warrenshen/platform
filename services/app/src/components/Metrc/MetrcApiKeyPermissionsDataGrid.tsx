import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { EnhancedMetrcApiKeyPermissions } from "lib/api/metrc";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(
  enhancedMetrcApiKeyPermissions: EnhancedMetrcApiKeyPermissions
) {
  return enhancedMetrcApiKeyPermissions.map(
    (enhancedMetrcApiKeyLicensePermissions) => ({
      ...enhancedMetrcApiKeyLicensePermissions,
      id: enhancedMetrcApiKeyLicensePermissions["license_number"],
      status: "TBD",
    })
  );
}

interface Props {
  enhancedMetrcApiKeyPermissions: EnhancedMetrcApiKeyPermissions;
}

export default function MetrcApiKeyPermissionsDataGrid({
  enhancedMetrcApiKeyPermissions,
}: Props) {
  const rows = getRows(enhancedMetrcApiKeyPermissions);
  const columns = useMemo(
    () => [
      {
        dataField: "license_number",
        caption: "License Number",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "us_state",
        caption: "US State",
        width: ColumnWidths.UsState,
      },
      {
        dataField: "license_category",
        caption: "License Category",
        width: ColumnWidths.Identifier,
      },
      {
        dataField: "license_description",
        caption: "License Description",
        width: ColumnWidths.Identifier,
      },
      {
        dataField: "license_status",
        caption: "License Status",
        width: ColumnWidths.Identifier,
      },
      // {
      //   dataField: "status",
      //   caption: "Status",
      //   minWidth: ColumnWidths.MinWidth,
      // },
      {
        dataField: "is_packages_enabled",
        caption: "Packages?",
        width: 120,
      },
      {
        dataField: "is_transfers_enabled",
        caption: "Transfers?",
        width: 120,
      },
      {
        dataField: "is_sales_receipts_enabled",
        caption: "Sales?",
        width: 120,
      },
      {
        dataField: "is_plant_batches_enabled",
        caption: "Plant Batches?",
        width: 120,
      },
      {
        dataField: "is_plants_enabled",
        caption: "Plants?",
        width: 120,
      },
      {
        dataField: "is_harvests_enabled",
        caption: "Harvests?",
        width: 120,
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={false}
      pager
      dataSource={rows}
      columns={columns}
    />
  );
}
