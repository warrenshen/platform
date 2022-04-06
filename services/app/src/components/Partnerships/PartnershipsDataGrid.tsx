import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import { CompanyPartnershipRequests } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isMultiSelectEnabled?: boolean;
  isSortingDisabled?: boolean;
  pager?: boolean;
  pageSize?: number;
  isClosedTab: boolean;
  partnershipRequests: any[];
  actionItems?: DataGridActionItem[];
  selectedRequestIds?: CompanyPartnershipRequests["id"][];
  handleSelectRequests?: (requests: any[]) => void;
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
    license_ids: request.license_info
      ? request.license_info.license_ids.join(", ")
      : "",
  }));
}

export default function PartnershipsDataGrid({
  isExcelExport = true,
  isFilteringEnabled = false,
  isMultiSelectEnabled = false,
  isSortingDisabled = false,
  pager = true,
  pageSize = 10,
  isClosedTab,
  partnershipRequests,
  actionItems,
  selectedRequestIds,
  handleSelectRequests,
}: Props) {
  const rows = useMemo(() => getRows(partnershipRequests), [
    partnershipRequests,
  ]);

  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 80,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        caption: "Requesting Company",
        dataField: "requesting_company.name",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Submitted By",
        dataField: "requested_by_user.full_name",
        width: ColumnWidths.UserName,
      },
      {
        caption: "New Company Type",
        dataField: "company_type",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "New Company Name",
        dataField: "company_name",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        visible: !isClosedTab,
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
        caption: "Closed At",
        dataField: "settled_at",
        width: ColumnWidths.Type,
        alignment: "center",
        visible: isClosedTab,
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.settled_at}
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
    [actionItems, isClosedTab]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectRequests && handleSelectRequests(selectedRowsData),
    [handleSelectRequests]
  );

  const allowedPageSizes = useMemo(() => [], []);
  const filtering = useMemo(() => ({ enable: isFilteringEnabled }), [
    isFilteringEnabled,
  ]);

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={filtering}
      pager={pager}
      select={isMultiSelectEnabled}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedRequestIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
