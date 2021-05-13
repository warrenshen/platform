import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { CompanyPartnershipRequests } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isSortingDisabled?: boolean;
  pager?: boolean;
  pageSize?: number;
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
  }));
}

export default function PartnershipsDataGrid({
  isExcelExport = false,
  isFilteringEnabled = false,
  isSortingDisabled = false,
  pager = true,
  pageSize = 10,
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
        caption: "Requested At",
        dataField: "created_at",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "License IDs",
        dataField: "license_info",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {params.row.data.license_info
              ? params.row.data.license_info.license_ids.join(", ")
              : ""}
          </Box>
        ),
      },
    ],
    [actionItems]
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
      select={true}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedRequestIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
