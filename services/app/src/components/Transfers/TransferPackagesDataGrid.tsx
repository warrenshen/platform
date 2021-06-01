import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { TransferPackage } from "lib/api/metrc";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  transferPackages: TransferPackage[];
}

export default function TransferPackagesDataGrid({
  isExcelExport = true,
  transferPackages,
}: Props) {
  const rows = useMemo(
    () =>
      transferPackages.map((transferPackage) => ({
        ...transferPackage,
        id: transferPackage.package_id,
      })),
    [transferPackages]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "transfer_id",
        caption: "Transfer ID",
        width: ColumnWidths.Date,
      },
      {
        fixed: true,
        dataField: "delivery_id",
        caption: "Delivery ID",
        width: ColumnWidths.Date,
      },
      {
        fixed: true,
        dataField: "manifest_number",
        caption: "Manifest #",
        width: ColumnWidths.Date,
      },
      {
        dataField: "origin_license",
        caption: "Origin License",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "origin_facility",
        caption: "Origin Facility",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "destination_license",
        caption: "Destination License",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "destination_facility",
        caption: "Destination Facility",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "type",
        caption: "Type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "package_id",
        caption: "Package Id",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "package_number",
        caption: "Package Number",
        minWidth: 240,
      },
      {
        dataField: "package_type",
        caption: "Package Type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "item",
        caption: "Item",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "item_category",
        caption: "Item Category",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "item_strain_name",
        caption: "Item Strain Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "item_state",
        caption: "Item State",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "received_quantity",
        caption: "Received Quantity",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "uom",
        caption: "UOM",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "item_unit_quantity",
        caption: "Item Unit Quantity",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "item_unit_weight",
        caption: "Item Unit Weight",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "is_testing_sample",
        caption: "Is Testing Sample",
        minWidth: ColumnWidths.MinWidth,
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled
      dataSource={rows}
      columns={columns}
    />
  );
}
