import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import MetrcTransferDrawerLauncher from "components/Transfers/MetrcTransferDrawerLauncher";
import { GetMetrcTransfersByUsStateManifestNumberQuery } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { ColumnWidths } from "lib/tables";
import { flatten } from "lodash";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  metrcTransfers: GetMetrcTransfersByUsStateManifestNumberQuery["metrc_transfers"];
}

export default function MetrcTransfersDataGrid({
  isExcelExport = true,
  metrcTransfers,
}: Props) {
  const rows = useMemo(
    () =>
      flatten(
        metrcTransfers.map((metrcTransfer) =>
          metrcTransfer.metrc_deliveries.map((metrcDelivery) => {
            return {
              id: metrcDelivery.id,
              manifest_number: metrcTransfer.manifest_number,
              last_modified_at: !!metrcTransfer?.last_modified_at
                ? parseDateStringServer(metrcTransfer.last_modified_at)
                : null,
              created_date: !!metrcTransfer?.created_date
                ? parseDateStringServer(metrcTransfer.created_date)
                : null,
              lab_results_status: metrcTransfer.lab_results_status,
              shipper_facility_license_number:
                metrcTransfer.shipper_facility_license_number,
              shipper_facility_name: metrcTransfer.shipper_facility_name,
              recipient_facility_license_number:
                metrcDelivery.recipient_facility_license_number,
              recipient_facility_name: metrcDelivery.recipient_facility_name,
              shipment_type_name: metrcDelivery.shipment_type_name,
              shipment_transaction_type:
                metrcDelivery.shipment_transaction_type,

              // vendor_name: getCompanyDisplayName(metrcTransfer.vendor),
            };
          })
        )
      ),
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
        alignment: "center",
        format: "longDateLongTime",
      },
      {
        caption: "Created Date",
        dataField: "created_date",
        width: ColumnWidths.Date,
        alignment: "right",
        format: "shortDate",
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
      {
        dataField: "recipient_facility_license_number",
        caption: "Recipient Facility License Number",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "recipient_facility_name",
        caption: "Recipient Facility Name",
        minWidth: ColumnWidths.MinWidth,
      },
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
