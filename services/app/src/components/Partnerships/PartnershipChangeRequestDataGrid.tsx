import { GridValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { CompanyPartnershipRequests } from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import {
  VendorChangeRequestsCategoryEnum,
  VendorChangeRequestsCategoryToLabel,
  VendorChangeRequestsStatusEnum,
  VendorChangeRequestsStatusToLabel,
} from "lib/enum";
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

function getRows(requests: any[]) {
  return requests.map((request) => ({
    ...request,
    category: !!request?.category ? request.category : "",
    requested_at: !!request?.created_at
      ? formatDatetimeString(request.created_at, false)
      : "",
    requested_by: !!request?.requesting_user?.full_name
      ? request.requesting_user.full_name
      : "",
    requesting_company: request?.requesting_company?.name
      ? request.requesting_company?.name
      : "",
    status: !!request?.status ? request.status : "",
    vendor: !!request?.requested_vendor?.name
      ? request.requested_vendor.name
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
        caption: "Category",
        dataField: "category",
        width: ColumnWidths.Type,
        alignment: "center",
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(VendorChangeRequestsCategoryEnum).map(
                (category) => ({
                  category: category,
                  label: VendorChangeRequestsCategoryToLabel[category],
                })
              ),
              key: "category",
            },
          },
          valueExpr: "category",
          displayExpr: "label",
        },
      },
      {
        caption: "Status",
        dataField: "status",
        width: ColumnWidths.Type,
        alignment: "center",
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(VendorChangeRequestsStatusEnum).map(
                (status) => ({
                  status: status,
                  label: VendorChangeRequestsStatusToLabel[status],
                })
              ),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "label",
        },
      },
      {
        caption: "Submitted By",
        dataField: "requested_by",
        width: ColumnWidths.UserName,
      },
      {
        caption: "Company",
        dataField: "requesting_company",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Vendor",
        dataField: "vendor",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Requested At",
        dataField: "requested_at",
        width: ColumnWidths.Type,
        alignment: "center",
      },
    ],
    [actionItems]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectRequests && handleSelectRequests(selectedRowsData),
    [handleSelectRequests]
  );

  const allowedPageSizes = useMemo(() => [], []);

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={{ enable: true }}
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
