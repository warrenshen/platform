import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { CompanyFacilities, CompanyFacilityFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  companyFacilities: CompanyFacilityFragment[];
  selectedCompanyFacilitiesIds?: CompanyFacilities["id"][];
  handleSelectCompanyFacilities?: (
    companyFacilities: CompanyFacilityFragment[]
  ) => void;
}

export default function CompanyFacilitiesDataGrid({
  isExcelExport = true,
  companyFacilities,
  selectedCompanyFacilitiesIds,
  handleSelectCompanyFacilities,
}: Props) {
  const rows = companyFacilities;
  const columns = useMemo(
    () => [
      {
        dataField: "name",
        caption: "Facility Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "address",
        caption: "Facility Address",
        minWidth: ColumnWidths.MinWidth,
      },
    ],
    []
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        !!handleSelectCompanyFacilities &&
        handleSelectCompanyFacilities(
          selectedRowsData as CompanyFacilityFragment[]
        ),
    [handleSelectCompanyFacilities]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={!!handleSelectCompanyFacilities}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompanyFacilitiesIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
