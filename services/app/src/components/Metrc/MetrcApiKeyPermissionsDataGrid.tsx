import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { MetrcApiKeyPermissions } from "lib/api/metrc";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(metrcApiKeyPermissions: MetrcApiKeyPermissions) {
  return metrcApiKeyPermissions.map((metrcApiKeyLicensePermissions) => ({
    ...metrcApiKeyLicensePermissions,
    id: metrcApiKeyLicensePermissions["license_number"],
    status: "TBD",
  }));
}

interface Props {
  metrcApiKeyPermissions: MetrcApiKeyPermissions;
}

export default function MetrcApiKeyPermissionsDataGrid({
  metrcApiKeyPermissions,
}: Props) {
  const rows = getRows(metrcApiKeyPermissions);
  const columns = useMemo(
    () => [
      {
        dataField: "license_number",
        caption: "License Number",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "status",
        caption: "Status",
        minWidth: ColumnWidths.MinWidth,
      },
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
