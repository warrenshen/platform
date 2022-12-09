import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  MetrcTransferPackageFragment,
  MetrcTransferPackages,
} from "generated/graphql";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isViewActionAvailable?: boolean;
  metrcTransferPackages: MetrcTransferPackageFragment[];
  selectedTransferPackageIds: MetrcTransferPackages["id"][];
  onSelectionChanged: (selectedRowIds: any) => void;
}

const MetrcTransferPackagesDataGrid = ({
  isExcelExport = true,
  metrcTransferPackages,
  selectedTransferPackageIds,
  onSelectionChanged,
}: Props) => {
  const rows = useMemo(
    () =>
      metrcTransferPackages.map((metrcTransferPackage) => {
        return {
          ...metrcTransferPackage,
        };
      }),
    [metrcTransferPackages]
  );

  const columns = useMemo(
    () => [
      {
        dataField: "product_name",
        caption: "Metrc Product Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "product_category_name",
        caption: "Metrc Product Category",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipped_quantity",
        caption: "Shipped Quantity (UoM)",
        width: ColumnWidths.Count,
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
        dataField: "shipped_unit_of_measure",
        caption: "Shipped Unit of Measure",
        width: ColumnWidths.Count,
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
      filtering={{ enable: true }}
      select
      pager
      pageSize={10}
      selectedRowKeys={selectedTransferPackageIds}
      onSelectionChanged={onSelectionChanged}
    />
  );
};

export default MetrcTransferPackagesDataGrid;
