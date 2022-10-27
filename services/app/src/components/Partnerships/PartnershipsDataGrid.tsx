import { GridValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { CompanyPartnershipRequests } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { ColumnWidths, formatRowModel } from "lib/tables";
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

function getRows(requests: any[]) {
  return requests.map((request) => {
    return formatRowModel({
      ...request,
      created_at: !!request?.created_at
        ? parseDateStringServer(request.created_at)
        : null,
      licenses: !!request?.license_info?.license_ids?.[0]
        ? request.license_info.license_ids.join(", ")
        : null,
      settled_at: !!request?.settled_at
        ? parseDateStringServer(request.settled_at)
        : null,
    });
  });
}

export default function PartnershipsDataGrid({
  isExcelExport = true,
  isFilteringEnabled = true,
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
  const rows = useMemo(
    () => getRows(partnershipRequests),
    [partnershipRequests]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 80,
        cellRender: (params: GridValueFormatterParams) => (
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
        format: "longDateLongTime",
      },
      {
        caption: "Closed At",
        dataField: "settled_at",
        width: ColumnWidths.Type,
        alignment: "center",
        visible: isClosedTab,
        format: "longDateLongTime",
      },
      {
        caption: "License IDs",
        dataField: "licenses",
        width: ColumnWidths.Type,
        alignment: "center",
      },
    ],
    [actionItems, isClosedTab]
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
