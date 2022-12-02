import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { MetrcToBespokeCatalogSkuFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
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
    dataField: "sku_confidence",
    caption: "Sku Confidence",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "bespoke_catalog_sku.id",
    caption: "Bespoke Catalog Sku Id",
    minWidth: ColumnWidths.MinWidth,
  },
];

interface Props {
  metrcToBespokeCatalogSkus: MetrcToBespokeCatalogSkuFragment[];
  isFilteringEnabled?: boolean;
}

const MetrcToBespokeCatalogSkusDataGrid = ({
  metrcToBespokeCatalogSkus,
  isFilteringEnabled = true,
}: Props) => {
  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={metrcToBespokeCatalogSkus}
      isExcelExport
      filtering={filtering}
      pager
      pageSize={10}
    />
  );
};

export default MetrcToBespokeCatalogSkusDataGrid;
