import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import MetrcTransferDrawerLauncher from "components/Transfers/MetrcTransferDrawerLauncher";
import MetrcPackageDrawerLauncher from "components/Transfers/MetrcTransferPackageDrawerLauncher";
import MetrcPackageModal from "components/Transfers/MetrcTransferPackageModal";
import { MetrcTransferPackageFragment } from "generated/graphql";
import { MetrcPackagePayload } from "lib/api/metrc";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isViewActionAvailable?: boolean;
  metrcTransferPackages: MetrcTransferPackageFragment[];
}

export default function MetrcTransferPackagesDataGrid({
  isExcelExport = true,
  isViewActionAvailable = false,
  metrcTransferPackages,
}: Props) {
  const rows = useMemo(
    () =>
      metrcTransferPackages.map((metrcTransferPackage) => {
        const packagePayload =
          metrcTransferPackage.package_payload as MetrcPackagePayload;
        return {
          ...metrcTransferPackage,
          manifest_number: metrcTransferPackage.metrc_transfer?.manifest_number,
          source_harvest_names: packagePayload["SourceHarvestNames"],
          source_package_labels: packagePayload["SourcePackageLabels"],
          lab_testing_state: packagePayload["LabTestingState"],
          item_category: packagePayload["ItemCategory"],
          item_strain_name: packagePayload["ItemStrainName"],
          item_state: packagePayload["ItemState"],
          shipment_package_state: packagePayload["ShipmentPackageState"],
          shipped_quantity: `${packagePayload["ShippedQuantity"]} (${packagePayload["ShippedUnitOfMeasureName"]})`,
          received_quantity: `${packagePayload["ReceivedQuantity"]} (${packagePayload["ReceivedUnitOfMeasureName"]})`,
          receiver_wholesale_price: packagePayload["ReceiverWholesalePrice"],
          item_unit_quantity: packagePayload["ItemUnitQuantity"],
          item_unit_weight: packagePayload["ItemUnitWeight"],
          is_testing_sample: packagePayload["IsTestingSample"],
        };
      }),
    [metrcTransferPackages]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "package_id",
        caption: "Package ID (Metrc)",
        width: ColumnWidths.MetrcId,
        cellRender: (params: ValueFormatterParams) => (
          <MetrcPackageDrawerLauncher
            label={params.row.data.package_id}
            metrcPackageId={params.row.data.id}
          />
        ),
      },
      {
        fixed: true,
        dataField: "manifest_number",
        caption: "Manifest #",
        width: ColumnWidths.MetrcId,
        cellRender: (params: ValueFormatterParams) => (
          <MetrcTransferDrawerLauncher
            label={params.row.data.manifest_number}
            metrcTransferId={params.row.data.transfer_id}
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
        dataField: "product_category_name",
        caption: "Product Category Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "product_name",
        caption: "Product Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipped_quantity",
        caption: "Shipped Quantity (UoM)",
        width: ColumnWidths.Count,
      },
      {
        dataField: "shipment_package_state",
        caption: "Shipment Package State",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "lab_results_status",
        caption: "Lab Results Status",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "package_type",
        caption: "Package Type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipper_wholesale_price",
        caption: "Shipper Wholesale Price",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "received_quantity",
        caption: "Received Quantity (UoM)",
        width: ColumnWidths.Count,
      },
      {
        dataField: "receiver_wholesale_price",
        caption: "Receiver Wholesale Price",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
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
