import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { MetrcToBespokeCatalogSkuFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import {
  createUpdateMetrcToBespokeCatalogSkuMutation,
  deleteMetrcToBespokeCatalogSkuMutation,
} from "lib/api/productCatalog";
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
  const [createUpdateMetrcToBespokeCatalogSku] = useCustomMutation(
    createUpdateMetrcToBespokeCatalogSkuMutation
  );

  const [deleteMetrcToBespokeCatalogSku] = useCustomMutation(
    deleteMetrcToBespokeCatalogSkuMutation
  );

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  const handleSave = async ({ data, key, type }: any) => {
    if (type === "remove") {
      deleteMetrcToBespokeCatalogSku({
        variables: {
          id: key,
        },
      });
    } else {
      createUpdateMetrcToBespokeCatalogSku({
        variables: {
          ...data,
          bespoke_catalog_sku_id: data.bespoke_catalog_sku.id,
          brand_confidence: null,
        },
      });
    }
  };

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={metrcToBespokeCatalogSkus}
      isExcelExport={false}
      filtering={filtering}
      editing={{ allowUpdating: true, allowDeleting: true, allowAdding: true }}
      onSaved={(e) => handleSave(e.changes?.[0])}
    />
  );
};

export default MetrcToBespokeCatalogSkusDataGrid;
