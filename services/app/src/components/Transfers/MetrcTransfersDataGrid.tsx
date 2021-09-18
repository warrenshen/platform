import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
// import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import MetrcTransferDrawerLauncher from "components/Transfers/MetrcTransferDrawerLauncher";
import { MetrcTransferFragment } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  metrcTransfers: MetrcTransferFragment[];
}

export default function MetrcTransfersDataGrid({
  isExcelExport = true,
  metrcTransfers,
}: Props) {
  const rows = useMemo(
    () =>
      metrcTransfers.map((metrcTransfer) => {
        const transferPayload = metrcTransfer.transfer_payload;
        return {
          ...metrcTransfer,
          vendor_name: getCompanyDisplayName(metrcTransfer.vendor),
          last_modified_at: transferPayload.LastModified,
        };
      }),
    [metrcTransfers]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "manifest_number",
        caption: "Manifest #",
        width: ColumnWidths.MetrcId,
        cellRender: (params: ValueFormatterParams) => (
          <MetrcTransferDrawerLauncher
            label={params.row.data.manifest_number}
            metrcTransferId={params.row.data.id}
          />
        ),
      },
      {
        dataField: "last_modified_at",
        caption: "Last Modified At",
        width: ColumnWidths.Datetime,
      },
      // {
      //   dataField: "vendor_name",
      //   caption: "Vendor Name",
      //   minWidth: ColumnWidths.MinWidth,
      //   cellRender: (params: ValueFormatterParams) => (
      //     <TextDataGridCell label={params.row.data.vendor_name} />
      //   ),
      // },
      {
        caption: "Created Date",
        dataField: "created_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.created_date} />
        ),
      },
      {
        dataField: "lab_results_status",
        caption: "Lab Results Status",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipper_facility_license_number",
        caption: "Shippper Facility License Number",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipper_facility_name",
        caption: "Shipper Facility Name",
        minWidth: ColumnWidths.MinWidth,
      },
      // {
      //   dataField: "destination_license",
      //   caption: "Destination License",
      //   minWidth: ColumnWidths.MinWidth,
      // },
      // {
      //   dataField: "destination_facility",
      //   caption: "Destination Facility",
      //   minWidth: ColumnWidths.MinWidth,
      // },
      {
        dataField: "shipment_type_name",
        caption: "Shipment Type Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipment_transaction_type",
        caption: "Shipment Transaction Type",
        minWidth: ColumnWidths.MinWidth,
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled
      dataSource={rows}
      columns={columns}
    />
  );
}
