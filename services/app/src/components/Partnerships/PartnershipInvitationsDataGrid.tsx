import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import {
  CompanyPartnershipInvitations,
  PartnershipInvitationFragment,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isSortingDisabled?: boolean;
  showCompanyName?: boolean;
  pager?: boolean;
  pageSize?: number;
  partnershipInvitations: any[];
  selectedRequestIds?: CompanyPartnershipInvitations["id"][];
  handleSelectRequests?: (
    partnerhipInvitation: PartnershipInvitationFragment[]
  ) => void;
}

function getRows(requests: any[]): RowsProp {
  return requests.map((request) => ({
    ...request,
    requesting_company: {
      ...request.requesting_company,
    },
  }));
}

export default function PartnershipsDataGrid({
  isExcelExport = true,
  isFilteringEnabled = false,
  isSortingDisabled = false,
  showCompanyName = true,
  pager = true,
  pageSize = 10,
  partnershipInvitations,
  selectedRequestIds,
  handleSelectRequests,
}: Props) {
  const rows = useMemo(
    () => getRows(partnershipInvitations),
    [partnershipInvitations]
  );

  const columns = useMemo(
    () => [
      {
        caption: "Requesting Company",
        dataField: "requesting_company.name",
        width: ColumnWidths.Type,
        alignment: "center",
        visible: showCompanyName,
      },
      {
        caption: "Email",
        dataField: "email",
        width: 250,
        alignment: "center",
      },
      {
        caption: "Requested At",
        dataField: "requested_at",
        width: ColumnWidths.Datetime,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.requested_at}
          />
        ),
      },
      {
        caption: "Closed At",
        dataField: "closed_at",
        width: ColumnWidths.Datetime,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.closed_at}
          />
        ),
      },
    ],
    [showCompanyName]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectRequests && handleSelectRequests(selectedRowsData),
    [handleSelectRequests]
  );

  const allowedPageSizes = useMemo(() => [], []);
  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={filtering}
      pager={pager}
      select={!!handleSelectRequests}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedRequestIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
