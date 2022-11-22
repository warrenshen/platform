import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  BespokeCatalogBrandFragment,
  BespokeCatalogSkuFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import {
  createUpdateBespokeCatalogSkuMutation,
  deleteBespokeCatalogSkuMutation,
} from "lib/api/productCatalog";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "sku",
    caption: "Product SKU",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "brand",
    caption: "Brand",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "brand_id",
    caption: "Brand ID",
    minWidth: ColumnWidths.MinWidth,
  },
];

const getRows = (bespokeCatalogSkus: BespokeCatalogSkuFragment[]) => {
  return bespokeCatalogSkus.map(
    (bespokeCatalogSku: BespokeCatalogSkuFragment) => {
      return {
        ...bespokeCatalogSku,
        brand: bespokeCatalogSku.bespoke_catalog_brand?.brand_name,
        brand_id: bespokeCatalogSku.bespoke_catalog_brand?.id,
      };
    }
  );
};

interface Props {
  bespokeCatalogSkus: BespokeCatalogSkuFragment[];
  bespokeCatalogBrands: BespokeCatalogBrandFragment[];
  isFilteringEnabled?: boolean;
}

const BespokeCatalogSkusDataGrid = ({
  bespokeCatalogSkus,
  bespokeCatalogBrands,
  isFilteringEnabled = true,
}: Props) => {
  const rows = useMemo(() => getRows(bespokeCatalogSkus), [bespokeCatalogSkus]);
  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  const [createUpdateBespokeCatalogSku] = useCustomMutation(
    createUpdateBespokeCatalogSkuMutation
  );

  const [deleteBespokeCatalogSku] = useCustomMutation(
    deleteBespokeCatalogSkuMutation
  );

  const handleSave = async ({ data, key, type }: any) => {
    if (type === "remove") {
      deleteBespokeCatalogSku({
        variables: {
          id: key,
        },
      });
    } else {
      const brand = bespokeCatalogBrands.find(
        (brand) => brand.brand_name === data.brand
      );
      if (brand) {
        createUpdateBespokeCatalogSku({
          variables: {
            id: key,
            sku: data.sku,
            brand_id: brand.id,
            brand_name: null,
          },
        });
      } else {
        createUpdateBespokeCatalogSku({
          variables: {
            id: key,
            sku: data.sku,
            brand_id: null,
            brand_name: data.brand,
          },
        });
      }
    }
  };

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={rows}
      isExcelExport={false}
      filtering={filtering}
      editing={{ allowUpdating: true, allowDeleting: true, allowAdding: true }}
      onSaved={(e) => handleSave(e.changes?.[0])}
    />
  );
};

export default BespokeCatalogSkusDataGrid;
