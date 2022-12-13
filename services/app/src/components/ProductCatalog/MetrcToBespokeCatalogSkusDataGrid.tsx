import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  MetrcToBespokeCatalogSkuFragment,
  MetrcToBespokeCatalogSkus,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "product_name",
    caption: "Metrc Product Name",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "product_category_name",
    caption: "Metrc Product Category Name",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "wholesale_quantity",
    caption: "Wholesale Quantity",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "sku_confidence",
    caption: "Sku Confidence",
    minWidth: ColumnWidths.Identifier,
  },
  {
    dataField: "sku_name",
    caption: "Bespoke Catalog SKU",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "sku_group_name",
    caption: "Bespoke Catalog SKU Group",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "brand_name",
    caption: "Bespoke Catalog Brand",
    minWidth: ColumnWidths.MinWidth,
  },
];

const getRows = (
  metrcToBespokeCatalogSkus: MetrcToBespokeCatalogSkuFragment[]
) => {
  return metrcToBespokeCatalogSkus.map(
    (metrcToBespokeCatalogSku: MetrcToBespokeCatalogSkuFragment) => {
      return {
        ...metrcToBespokeCatalogSku,
        sku_name: metrcToBespokeCatalogSku.bespoke_catalog_sku?.sku,
        sku_group_name:
          metrcToBespokeCatalogSku.bespoke_catalog_sku
            ?.bespoke_catalog_sku_group?.sku_group_name,
        brand_name:
          metrcToBespokeCatalogSku.bespoke_catalog_sku
            ?.bespoke_catalog_sku_group?.bespoke_catalog_brand?.brand_name,
      };
    }
  );
};

interface Props {
  isFilteringEnabled?: boolean;
  metrcToBespokeCatalogSkus: MetrcToBespokeCatalogSkuFragment[];
  selectedMetricToBespokeCatalogSkuIds: MetrcToBespokeCatalogSkus["id"][];
  onSelectionChanged: (selectedRowKeys: any) => void;
}

const MetrcToBespokeCatalogSkusDataGrid = ({
  metrcToBespokeCatalogSkus,
  isFilteringEnabled = true,
  selectedMetricToBespokeCatalogSkuIds,
  onSelectionChanged,
}: Props) => {
  const rows = useMemo(
    () => getRows(metrcToBespokeCatalogSkus),
    [metrcToBespokeCatalogSkus]
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
      filtering={filtering}
      pager
      pageSize={10}
      select
      selectedRowKeys={selectedMetricToBespokeCatalogSkuIds}
      onSelectionChanged={onSelectionChanged}
    />
  );
};

export default MetrcToBespokeCatalogSkusDataGrid;
