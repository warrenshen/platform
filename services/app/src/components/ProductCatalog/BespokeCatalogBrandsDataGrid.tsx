import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { BespokeCatalogBrandFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import {
  createUpdateBespokeCatalogBrandMutation,
  deleteBespokeCatalogBrandMutation,
} from "lib/api/productCatalog";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "brand_name",
    caption: "Bespoke Brand",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "us_state",
    caption: "US State",
    minWidth: ColumnWidths.UsState,
  },
  {
    dataField: "id",
    caption: "Bespoke Brand ID",
    minWidth: ColumnWidths.MinWidth,
  },
];

const getRows = (bespokeCatalogBrands: any) => {
  return bespokeCatalogBrands.map((bespokeCatalogBrand: any) => {
    return {
      ...bespokeCatalogBrand,
    };
  });
};

interface Props {
  bespokeCatalogBrands: BespokeCatalogBrandFragment[];
  isFilteringEnabled?: boolean;
}

const BespokeCatalogBrandsDataGrid = ({
  bespokeCatalogBrands,
  isFilteringEnabled = true,
}: Props) => {
  const [createUpdateBespokeCatalogBrand] = useCustomMutation(
    createUpdateBespokeCatalogBrandMutation
  );

  const [deleteBespokeCatalogBrand] = useCustomMutation(
    deleteBespokeCatalogBrandMutation
  );

  const rows = useMemo(
    () => getRows(bespokeCatalogBrands),
    [bespokeCatalogBrands]
  );

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  const handleSave = async ({ data, key, type }: any) => {
    if (type === "remove") {
      deleteBespokeCatalogBrand({
        variables: {
          id: key,
        },
      });
    } else {
      createUpdateBespokeCatalogBrand({
        variables: {
          ...data,
        },
      });
    }
  };

  return (
    <ControlledDataGrid
      columns={columns}
      dataSource={rows}
      isExcelExport={false}
      filtering={filtering}
      pager
      editing={{ allowUpdating: true, allowDeleting: true, allowAdding: true }}
      onSaved={(e) => handleSave(e.changes?.[0])}
    />
  );
};

export default BespokeCatalogBrandsDataGrid;
