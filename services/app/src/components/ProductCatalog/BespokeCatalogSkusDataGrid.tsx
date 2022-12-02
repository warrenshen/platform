import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  BespokeCatalogSkuFragment,
  BespokeCatalogSkus,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "sku",
    caption: "Bespoke Product SKU",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "sku_group_name",
    caption: "Bespoke Product SKU Group",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "brand_name",
    caption: "Bespoke Brand",
    minWidth: ColumnWidths.MinWidth,
  },
];

const getRows = (bespokeCatalogSkus: BespokeCatalogSkuFragment[]) => {
  return bespokeCatalogSkus.map(
    (bespokeCatalogSku: BespokeCatalogSkuFragment) => {
      return {
        ...bespokeCatalogSku,
        sku_group_name:
          bespokeCatalogSku.bespoke_catalog_sku_group?.sku_group_name,
        brand_name:
          bespokeCatalogSku.bespoke_catalog_sku_group?.bespoke_catalog_brand
            ?.brand_name,
      };
    }
  );
};

interface Props {
  bespokeCatalogSkus: BespokeCatalogSkuFragment[];
  isFilteringEnabled?: boolean;
  isSingleSelectEnabled?: boolean;
  selectedBespokeCatalogSkuIds?: BespokeCatalogSkus["id"][];
  onSelectionChanged?: (selectedRowKeys: any) => void;
  onInitNewRow?: (newRow: any) => void;
}

const BespokeCatalogSkusDataGrid = ({
  bespokeCatalogSkus,
  selectedBespokeCatalogSkuIds,
  isSingleSelectEnabled = false,
  isFilteringEnabled = true,
  onSelectionChanged,
  onInitNewRow,
}: Props) => {
  const rows = useMemo(() => getRows(bespokeCatalogSkus), [bespokeCatalogSkus]);
  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={rows}
      isExcelExport
      singleSelect={isSingleSelectEnabled}
      selectedRowKeys={selectedBespokeCatalogSkuIds}
      onSelectionChanged={onSelectionChanged}
      onInitNewRow={onInitNewRow}
      filtering={filtering}
      pager
    />
  );
};

export default BespokeCatalogSkusDataGrid;
