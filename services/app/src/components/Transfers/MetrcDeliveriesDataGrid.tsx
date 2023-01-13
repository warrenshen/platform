import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { MetrcDeliveryFragment } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  metrcDeliveries: MetrcDeliveryFragment[];
}

export default function MetrcTransfersDataGrid({
  isExcelExport = true,
  metrcDeliveries,
}: Props) {
  const rows = useMemo(
    () =>
      metrcDeliveries.map((metrcDelivery) => {
        return formatRowModel({
          ...metrcDelivery,
          delivery_id: metrcDelivery.delivery_id,
          id: metrcDelivery.id,
          received_datetime: !!metrcDelivery?.received_datetime
            ? parseDateStringServer(metrcDelivery.received_datetime, true)
            : null,
        });
      }),
    [metrcDeliveries]
  );

  const columns = useMemo(
    () => [
      {
        caption: "Delivery ID",
        dataField: "delivery_id",
        width: ColumnWidths.MinWidth,
        alignment: "left",
      },
      {
        dataField: "received_datetime",
        caption: "Received Datetime",
        width: ColumnWidths.Datetime,
        format: "longDateLongTime",
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
