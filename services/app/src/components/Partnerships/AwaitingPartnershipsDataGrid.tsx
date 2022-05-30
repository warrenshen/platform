import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  pager?: boolean;
  pageSize?: number;
  partnershipRequests: any[];
}

function getRows(requests: any[]): RowsProp {
  return requests.map((request) => ({
    ...request,
    requesting_company: {
      ...request.requesting_company,
    },
    requested_by_user: {
      ...request.requested_by_user,
    },
    requested_by_full_name: !!request.requested_by_user?.full_name
      ? request.requested_by_user.full_name
      : !!request.user_info?.first_name && !!request.user_info?.last_name
      ? `${request.user_info.first_name} ${request.user_info.last_name}`
      : "",
    license_ids: request.license_info
      ? request.license_info.license_ids.join(", ")
      : "",
  }));
}

export default function AwaitingPartnershipsDataGrid({
  isExcelExport = true,
  pager = true,
  pageSize = 10,
  partnershipRequests,
}: Props) {
  const rows = useMemo(
    () => getRows(partnershipRequests),
    [partnershipRequests]
  );

  const columns = useMemo(
    () => [
      {
        caption: "Submitted By",
        dataField: "requested_by_full_name",
        width: ColumnWidths.MinWidth,
      },
      {
        caption: "New Company Name",
        dataField: "company_name",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Requested At",
        dataField: "created_at",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.created_at}
          />
        ),
      },
      {
        caption: "License IDs",
        dataField: "license_info",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <Box>{params.row.data.license_ids}</Box>
        ),
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager={pager}
      pageSize={pageSize}
      dataSource={rows}
      columns={columns}
    />
  );
}
