import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { MetrcPackageFragment } from "generated/graphql";
import { MetrcPackagePayload } from "lib/api/metrc";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  metrcPackages: MetrcPackageFragment[];
}

export default function MetrcPackagesDataGrid({
  isExcelExport = false,
  metrcPackages,
}: Props) {
  const rows = useMemo(
    () =>
      metrcPackages.map((metrcPackage) => {
        const packagePayload = metrcPackage.package_payload as MetrcPackagePayload;
        return {
          ...metrcPackage,
          source_harvest_names: packagePayload["SourceHarvestNames"],
          source_package_labels: packagePayload["SourcePackageLabels"],
          product_category_name: packagePayload["ProductCategoryName"],
          lab_testing_state: packagePayload["LabTestingState"],
          item_category: packagePayload["ItemCategory"],
          item_strain_name: packagePayload["ItemStrainName"],
          item_state: packagePayload["ItemState"],
          received_quantity: packagePayload["ReceivedQuantity"],
          item_unit_quantity: packagePayload["ItemUnitQuantity"],
          item_unit_weight: packagePayload["ItemUnitWeight"],
          is_testing_sample: packagePayload["IsTestingSample"],
        };
      }),
    [metrcPackages]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "package_id",
        caption: "Pacakage ID",
        width: ColumnWidths.MetrcId,
      },
      {
        fixed: true,
        dataField: "delivery_id",
        caption: "Delivery ID",
        width: ColumnWidths.MetrcId,
      },
      {
        dataField: "label",
        caption: "Label",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "type",
        caption: "Type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "product_name",
        caption: "Product Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "product_category_name",
        caption: "Product Category Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "lab_results_status",
        caption: "Lab Results Status",
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
      // {
      //   dataField: "uom",
      //   caption: "UOM",
      //   minWidth: ColumnWidths.MinWidth,
      // },
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
