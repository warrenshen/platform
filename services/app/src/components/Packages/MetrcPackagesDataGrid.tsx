import { ValueFormatterParams } from "@material-ui/data-grid";
import MetrcPackageDrawerLauncher from "components/Packages/MetrcPackageDrawerLauncher";
import MetrcPackageModal from "components/Packages/MetrcPackageModal";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import { MetrcPackageFragment } from "generated/graphql";
// import { MetrcPackagePayload } from "lib/api/metrc";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isViewActionAvailable?: boolean;
  metrcPackages: MetrcPackageFragment[];
}

export default function MetrcPackagesDataGrid({
  isExcelExport = true,
  isViewActionAvailable = false,
  metrcPackages,
}: Props) {
  const rows = useMemo(
    () =>
      metrcPackages.map((metrcPackage) => {
        // const packagePayload = metrcPackage.package_payload as MetrcPackagePayload;
        return {
          ...metrcPackage,
          company_id: metrcPackage?.company_id,
        };
      }),
    [metrcPackages]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "package_id",
        caption: "Package ID (Metrc)",
        width: ColumnWidths.MetrcId,
        cellRender: (params: ValueFormatterParams) => (
          <MetrcPackageDrawerLauncher
            label={params.row.data.package_id}
            metrcPackageId={params.row.data.id}
          />
        ),
      },
      {
        visible: isViewActionAvailable,
        dataField: undefined,
        caption: "",
        width: 90,
        cellRender: (params: ValueFormatterParams) => (
          <ModalButton
            label={"View"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <MetrcPackageModal
                metrcPackageId={params.row.data.id}
                handleClose={handleClose}
              />
            )}
          />
        ),
      },
      {
        dataField: "type",
        caption: "Type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "package_label",
        caption: "Package Label",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Packaged Date",
        dataField: "packaged_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.packaged_date} />
        ),
      },
      {
        caption: "Last Modified At",
        dataField: "last_modified_at",
        width: ColumnWidths.Datetime,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.last_modified_at}
          />
        ),
      },
      {
        dataField: "package_type",
        caption: "Package Type",
        minWidth: ColumnWidths.MinWidth,
      },
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
        caption: "Quantity",
        dataField: "quantity",
        minWidth: ColumnWidths.MinWidth,
        alignment: "right",
      },
      {
        caption: "Unit of Measure",
        dataField: "unit_of_measure",
        width: ColumnWidths.MinWidth,
        alignment: "right",
      },
    ],
    [isViewActionAvailable]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      dataSource={rows}
      columns={columns}
    />
  );
}
