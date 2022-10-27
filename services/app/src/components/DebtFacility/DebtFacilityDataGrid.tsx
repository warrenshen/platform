import { GridValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import ListDataGridCell from "components/Shared/DataGrid/ListDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import { DebtFacilities, GetDebtFacilitiesQuery } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

type Facilities = GetDebtFacilitiesQuery["debt_facilities"];

interface Props {
  facilities: Facilities;
  handleSelectDebtFacilities: (facilities: DebtFacilities["id"][]) => void;
  selectedDebtFacilityIds: DebtFacilities["id"][];
  isExcelExport?: boolean;
  isSortingDisabled?: boolean;
  pager?: boolean;
  pageSize?: number;
}

function getRows(facilities: Facilities) {
  return facilities.map((facility) => ({
    ...facility,
    supported_product_types: !!facility.product_types
      ? facility.product_types["supported"].map(
          (product: string) => ProductTypeToLabel[product as ProductTypeEnum]
        )
      : [],
    max_capacity: !!facility.maximum_capacities[0]?.amount
      ? facility.maximum_capacities[0].amount
      : 0,
    drawn_capacity: !!facility.drawn_capacities[0]?.amount
      ? facility.drawn_capacities[0].amount
      : 0,
  }));
}

export default function DebtFacilityCapacityDataGrid({
  facilities,
  handleSelectDebtFacilities,
  selectedDebtFacilityIds,
  isExcelExport = true,
  isSortingDisabled = false,
  pager = true,
  pageSize = 10,
}: Props) {
  const rows = useMemo(() => getRows(facilities), [facilities]);
  const allowedPageSizes = useMemo(() => [], []);

  const columns = useMemo(
    () => [
      {
        caption: "Facility Name",
        dataField: "name",
        width: ColumnWidths.MinWidth,
        alignment: "left",
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.name} />
        ),
      },
      {
        caption: "Product Types",
        dataField: "product_types",
        width: ColumnWidths.ProductType,
        alignment: "left",
        cellRender: (params: GridValueFormatterParams) => (
          <ListDataGridCell values={params.row.data.supported_product_types} />
        ),
      },
      {
        caption: "Drawn Capacity",
        dataField: "drawn_capacity",
        width: ColumnWidths.Currency,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.drawn_capacity} />
        ),
      },
      {
        caption: "Max Capacity",
        dataField: "max_capacity",
        width: ColumnWidths.Currency,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.max_capacity} />
        ),
      },
    ],
    []
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectDebtFacilities &&
        handleSelectDebtFacilities(selectedRowsData as DebtFacilities[]),
    [handleSelectDebtFacilities]
  );

  return (
    <ControlledDataGrid
      select
      isExcelExport
      isSortingDisabled
      pager={pager}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedDebtFacilityIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
