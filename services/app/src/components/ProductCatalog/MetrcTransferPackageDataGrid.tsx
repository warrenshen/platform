import { GridValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import MetrcPackageDrawerLauncher from "components/Transfers/v2/MetrcPackageDrawerLauncher";
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

// TODO: columns still TBD, set up file for https://www.notion.so/bespokefinancial/Set-up-api-server-to-query-Google-BQ-3c2d68dbb7444f8187522bb13e00b0b2
const MetrcTransferPackagesDataGrid = ({
  isExcelExport = true,
  metrcTransferPackages,
}: Props) => {
  const rows = useMemo(
    () =>
      metrcTransferPackages.map((metrcTransferPackage) => {
        // const packagePayload =
        //   metrcTransferPackage.package_payload as MetrcPackagePayload;
        return {
          ...metrcTransferPackage,
          //   manifest_number: metrcTransferPackage.metrc_transfer?.manifest_number,
          //   item_category: packagePayload["ItemCategory"],
          //   item_strain_name: packagePayload["ItemStrainName"],
          //   item_state: packagePayload["ItemState"],
          //   shipment_package_state: packagePayload["ShipmentPackageState"],
          //   shipped_quantity: `${packagePayload["ShippedQuantity"]} (${packagePayload["ShippedUnitOfMeasureName"]})`,
          //   received_quantity: `${packagePayload["ReceivedQuantity"]} (${packagePayload["ReceivedUnitOfMeasureName"]})`,
          //   receiver_wholesale_price: packagePayload["ReceiverWholesalePrice"],
          //   item_unit_quantity: packagePayload["ItemUnitQuantity"],
          //   item_unit_weight: packagePayload["ItemUnitWeight"],
        };
      }),
    [metrcTransferPackages]
  );

  const columns = useMemo(
    () => [
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
      //   {
      //     dataField: "shipment_package_state",
      //     caption: "Shipment Package State",
      //     minWidth: ColumnWidths.MinWidth,
      //   },

      //   {
      //     dataField: "shipped_quantity",
      //     caption: "Shipped Quantity (UoM)",
      //     width: ColumnWidths.Count,
      //   },
      //   {
      //     dataField: "shipper_wholesale_price",
      //     caption: "Shipper Wholesale Price",
      //     format: {
      //       type: "currency",
      //       precision: CurrencyPrecision,
      //     },
      //     width: ColumnWidths.Currency,
      //     alignment: "right",
      //   },
      //   {
      //     dataField: "received_quantity",
      //     caption: "Received Quantity (UoM)",
      //     width: ColumnWidths.Count,
      //   },
      //   {
      //     dataField: "receiver_wholesale_price",
      //     caption: "Receiver Wholesale Price",
      //     format: {
      //       type: "currency",
      //       precision: CurrencyPrecision,
      //     },
      //     width: ColumnWidths.Currency,
      //     alignment: "right",
      //   },

      //   {
      //     dataField: "item_category",
      //     caption: "Item Category",
      //     minWidth: ColumnWidths.MinWidth,
      //   },
      //   {
      //     dataField: "item_strain_name",
      //     caption: "Item Strain Name",
      //     minWidth: ColumnWidths.MinWidth,
      //   },
      //   {
      //     dataField: "item_state",
      //     caption: "Item State",
      //     minWidth: ColumnWidths.MinWidth,
      //   },
      //   {
      //     dataField: "item_unit_quantity",
      //     caption: "Item Unit Quantity",
      //     minWidth: ColumnWidths.MinWidth,
      //   },
      //   {
      //     dataField: "item_unit_weight",
      //     caption: "Item Unit Weight",
      //     minWidth: ColumnWidths.MinWidth,
      //   },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled
      dataSource={rows}
      columns={columns}
      select
      pager
      pageSize={100}
    />
  );
};

export default MetrcTransferPackagesDataGrid;
