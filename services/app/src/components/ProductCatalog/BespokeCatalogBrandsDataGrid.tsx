import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { BespokeCatalogBrandFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "brand_name",
    caption: "Bespoke Brand",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "parent_company_name",
    caption: "Parent Company",
    minWidth: ColumnWidths.MinWidth,
  },
];

const getRows = (bespokeCatalogBrands: any) => {
  return bespokeCatalogBrands.map((bespokeCatalogBrand: any) => {
    return {
      ...bespokeCatalogBrand,
      parent_company_name: bespokeCatalogBrand?.parent_company?.name,
    };
  });
};

interface Props {
  bespokeCatalogBrands: BespokeCatalogBrandFragment[];
  isFilteringEnabled?: boolean;
  selectedBespokeCatalogBrandIds?: BespokeCatalogBrandFragment["id"][];
  onSelectionChanged?: (selectedRowKeys: any) => void;
}

const BespokeCatalogBrandsDataGrid = ({
  bespokeCatalogBrands,
  isFilteringEnabled = true,
  selectedBespokeCatalogBrandIds,
  onSelectionChanged,
}: Props) => {
  const rows = useMemo(
    () => getRows(bespokeCatalogBrands),
    [bespokeCatalogBrands]
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
      select
      selectedRowKeys={selectedBespokeCatalogBrandIds}
      onSelectionChanged={onSelectionChanged}
    />
  );
};

export default BespokeCatalogBrandsDataGrid;
