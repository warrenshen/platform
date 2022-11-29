import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  BespokeCatalogBrandFragment,
  BespokeCatalogSkuFragment,
  BespokeCatalogSkus,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import {
  createUpdateBespokeCatalogSkuMutation,
  deleteBespokeCatalogSkuMutation,
} from "lib/api/productCatalog";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

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
  isSingleSelectEnabled?: boolean;
  selectedBespokeCatalogSkuIds?: BespokeCatalogSkus["id"][];
  onSelectionChanged?: (selectedRowKeys: any) => void;
  onInitNewRow?: (newRow: any) => void;
}

const BespokeCatalogSkusDataGrid = ({
  bespokeCatalogSkus,
  bespokeCatalogBrands,
  isFilteringEnabled = true,
  isSingleSelectEnabled = false,
  selectedBespokeCatalogSkuIds,
  onSelectionChanged,
  onInitNewRow,
}: Props) => {
  const rows = useMemo(() => getRows(bespokeCatalogSkus), [bespokeCatalogSkus]);
  const columns = useMemo(
    () => [
      {
        dataField: "sku",
        caption: "Bespoke Product SKU",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "brand",
        caption: "Bespoke Brand",
        minWidth: ColumnWidths.MinWidth,
      },
      // {
      //   dataField: "brand_id",
      //   caption: "Bespoke Brand ID",
      //   minWidth: ColumnWidths.MinWidth,
      // },
    ],
    []
  );
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
      pager
      singleSelect={isSingleSelectEnabled}
      selectedRowKeys={selectedBespokeCatalogSkuIds}
      onSelectionChanged={onSelectionChanged}
      onInitNewRow={onInitNewRow}
      editing={{ allowUpdating: true, allowDeleting: true, allowAdding: true }}
      onSaved={(e) => handleSave(e.changes?.[0])}
    />
  );
};

export default BespokeCatalogSkusDataGrid;
