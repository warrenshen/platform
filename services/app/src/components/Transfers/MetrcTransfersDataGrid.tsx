import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";
import { MetrcTransferFragment } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { ValueFormatterParams } from "@material-ui/data-grid";
import MetrcTransferDrawerLauncher from "components/Transfers/MetrcTransferDrawerLauncher";

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
          origin_license: transferPayload.ShipperFacilityLicenseNumber,
          origin_facility: transferPayload.ShipperFacilityName,
          destination_license: transferPayload.RecipientFacilityLicenseNumber,
          destination_facility: transferPayload.RecipientFacilityName,
          shipment_type_name:
            metrcTransfer.shipment_type_name ||
            transferPayload.ShipmentTypeName,
          shipment_transaction_type:
            metrcTransfer.shipment_transaction_type ||
            transferPayload.ShipmentTransactionType,
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
            companyId={params.row.data.company_id}
            metrcTransferId={params.row.data.id}
          />
        ),
      },
      // {
      //   dataField: "delivery_id",
      //   caption: "Delivery ID",
      //   width: ColumnWidths.MetrcId,
      // },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.vendor_name} />
        ),
      },
      {
        dataField: "transfer_type",
        caption: "Transfer Type",
        width: 230,
      },
      {
        dataField: "lab_results_status",
        caption: "Lab Results Status",
        minWidth: ColumnWidths.MinWidth,
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
        dataField: "shipment_type_name",
        caption: "Shipment Type Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "shipment_transaction_type",
        caption: "Shipment Transaction Type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "last_modified_at",
        caption: "Last Modified At",
        width: ColumnWidths.Datetime,
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
