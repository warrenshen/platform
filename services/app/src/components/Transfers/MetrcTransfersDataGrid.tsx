import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";
import { MetrcTransferFragment } from "generated/graphql";

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
          origin_license: transferPayload.ShipperFacilityLicenseNumber,
          origin_facility: transferPayload.ShipperFacilityName,
          destination_license: transferPayload.RecipientFacilityLicenseNumber,
          destination_facility: transferPayload.RecipientFacilityName,
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
        width: ColumnWidths.Date,
      },
      {
        fixed: true,
        dataField: "delivery_id",
        caption: "Delivery ID",
        width: ColumnWidths.Date,
      },
      {
        dataField: "origin_license",
        caption: "Origin License",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "origin_facility",
        caption: "Origin Facility",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "destination_license",
        caption: "Destination License",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "destination_facility",
        caption: "Destination Facility",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "type",
        caption: "Type",
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
