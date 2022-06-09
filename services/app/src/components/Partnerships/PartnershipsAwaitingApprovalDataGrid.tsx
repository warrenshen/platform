import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { PartnershipInvitationFragment } from "generated/graphql";
import { PartnershipAwatingApproval } from "pages/Customer/Vendors/VendorsPageContent";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isSortingDisabled?: boolean;
  showCompanyName?: boolean;
  pager?: boolean;
  pageSize?: number;
  partnershipsAwaitingApproval: PartnershipAwatingApproval[];
  handleSelectRequests?: (
    partnerhipInvitation: PartnershipInvitationFragment[]
  ) => void;
}

export default function PartnershipsDataGrid({
  isExcelExport = true,
  isFilteringEnabled = false,
  isSortingDisabled = false,
  pager = true,
  pageSize = 10,
  partnershipsAwaitingApproval,
  handleSelectRequests,
}: Props) {
  const rows = partnershipsAwaitingApproval;

  const columns = useMemo(
    () => [
      {
        caption: "Vendor Name",
        dataField: "vendor_name",
        width: 200,
        alignment: "center",
      },
      {
        caption: "Submitted By",
        dataField: "submitted_by",
        width: 200,
        alignment: "center",
      },
      {
        caption: "Submitted At",
        dataField: "submitted_at",
        width: 200,
        alignment: "center",
      },
      {
        caption: "Email",
        dataField: "email",
        width: 200,
        alignment: "center",
      },
      {
        caption: "License Numbers",
        dataField: "license_numbers",
        width: 200,
        alignment: "center",
      },
      {
        caption: "Category",
        dataField: "category",
        width: 200,
        alignment: "center",
      },
    ],
    []
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
      selectedRowKeys={[]}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
