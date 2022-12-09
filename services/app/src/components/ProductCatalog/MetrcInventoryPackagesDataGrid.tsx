import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { MetrcPackageFragment, MetrcPackages } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isViewActionAvailable?: boolean;
  metrcInventoryPackages: MetrcPackageFragment[];
  selectedInventoryPackageIds: MetrcPackages["id"][];
  onSelectionChanged: (selectedRowIds: any) => void;
}
// TODO: Discuss with Spencer which additional columns if any will be most helpful
const columns = [
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
];

const MetrcInventoryPackagesDataGrid = ({
  isExcelExport = true,
  metrcInventoryPackages,
  selectedInventoryPackageIds,
  onSelectionChanged,
}: Props) => {
  const rows = useMemo(
    () =>
      metrcInventoryPackages.map((metrcInventoryPackage) => {
        return {
          ...metrcInventoryPackage,
        };
      }),
    [metrcInventoryPackages]
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
      selectedRowKeys={selectedInventoryPackageIds}
      onSelectionChanged={onSelectionChanged}
    />
  );
};

export default MetrcInventoryPackagesDataGrid;
