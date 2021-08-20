import { ValueFormatterParams } from "@material-ui/data-grid";
import MetrcPackageDrawerLauncher from "components/Packages/MetrcPackageDrawerLauncher";
import MetrcPackageModal from "components/Packages/MetrcPackageModal";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import { MetrcPackageFragment } from "generated/graphql";
import { MetrcPackagePayload } from "lib/api/metrc";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isViewActionAvailable?: boolean;
  metrcPackages: MetrcPackageFragment[];
}

export default function MetrcPackagesDataGrid({
  isExcelExport = true,
  isViewActionAvailable = false,
  metrcPackages,
}: Props) {
  const rows = useMemo(
    () =>
      metrcPackages.map((metrcPackage) => {
        const packagePayload = metrcPackage.package_payload as MetrcPackagePayload;
        return {
          ...metrcPackage,
          company_id: metrcPackage?.company_id,
          source_harvest_names: packagePayload["SourceHarvestNames"],
          source_package_labels: packagePayload["SourcePackageLabels"],
          lab_testing_state: packagePayload["LabTestingState"],
          item_category: packagePayload["ItemCategory"],
          item_strain_name: packagePayload["ItemStrainName"],
          item_state: packagePayload["ItemState"],
          shipped_quantity: `${packagePayload["ShippedQuantity"]} (${packagePayload["ShippedUnitOfMeasureName"]})`,
          received_quantity: `${packagePayload["ReceivedQuantity"]} (${packagePayload["ReceivedUnitOfMeasureName"]})`,
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
        caption: "Metrc ID",
        width: ColumnWidths.MetrcId,
        cellRender: (params: ValueFormatterParams) => (
          <MetrcPackageDrawerLauncher
            label={params.row.data.package_id}
            metrcPackageId={params.row.data.id}
          />
        ),
      },
      {
        visible: isViewActionAvailable,
        dataField: undefined,
        caption: "",
        width: 90,
        cellRender: (params: ValueFormatterParams) => (
          <ModalButton
            label={"View"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <MetrcPackageModal
                metrcPackageId={params.row.data.id}
                handleClose={handleClose}
              />
            )}
          />
        ),
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
        dataField: "label",
        caption: "Label",
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
    [isViewActionAvailable]
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
