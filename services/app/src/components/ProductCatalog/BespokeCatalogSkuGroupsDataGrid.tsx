import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  BespokeCatalogSkuGroupFragment,
  BespokeCatalogSkuGroups,
} from "generated/graphql";
import { SkuGroupUnitOfMeasureToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "sku_group_name",
    caption: "Bespoke Product SKU Group",
    minWidth: ColumnWidths.Comment,
  },
  {
    dataField: "unit_quantity",
    caption: "Unit Quantity",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "unit_of_measure",
    caption: "Unit of Measure",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "brand_name",
    caption: "Bespoke Brand",
    minWidth: ColumnWidths.MinWidth,
  },
];

const getRows = (bespokeCatalogSkuGroups: BespokeCatalogSkuGroupFragment[]) => {
  return bespokeCatalogSkuGroups.map(
    (bespokeCatalogSkuGroup: BespokeCatalogSkuGroupFragment) => {
      return {
        ...bespokeCatalogSkuGroup,
        unit_of_measure: !!bespokeCatalogSkuGroup.unit_of_measure
          ? SkuGroupUnitOfMeasureToLabel[
              bespokeCatalogSkuGroup.unit_of_measure as keyof typeof SkuGroupUnitOfMeasureToLabel
            ]
          : null,
        brand_name: bespokeCatalogSkuGroup?.bespoke_catalog_brand?.brand_name,
      };
    }
  );
};

interface Props {
  bespokeCatalogSkuGroups: BespokeCatalogSkuGroupFragment[];
  isFilteringEnabled?: boolean;
  selectedBespokeCatalogSkuGroupIds?: BespokeCatalogSkuGroups["id"][];
  onSelectionChanged?: (selectedRowKeys: any) => void;
  onInitNewRow?: (newRow: any) => void;
}

const BespokeCatalogSkuGroupsDataGrid = ({
  bespokeCatalogSkuGroups,
  selectedBespokeCatalogSkuGroupIds,
  isFilteringEnabled = true,
  onSelectionChanged,
  onInitNewRow,
}: Props) => {
  const rows = useMemo(
    () => getRows(bespokeCatalogSkuGroups),
    [bespokeCatalogSkuGroups]
  );
  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={rows}
      isExcelExport
      select
      selectedRowKeys={selectedBespokeCatalogSkuGroupIds}
      onSelectionChanged={onSelectionChanged}
      onInitNewRow={onInitNewRow}
      filtering={filtering}
      pager
    />
  );
};

export default BespokeCatalogSkuGroupsDataGrid;
