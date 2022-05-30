import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { UserFragment, UserRolesEnum, Users } from "generated/graphql";
import { UserRoleToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isRoleVisible?: boolean;
  pager?: boolean;
  users: UserFragment[];
  selectedUserIds?: Users["id"][];
  handleSelectUsers?: (users: Users[]) => void;
  actionItems?: DataGridActionItem[];
}

export default function UsersDataGrid({
  isCompanyVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  isRoleVisible = false,
  pager = true,
  users,
  selectedUserIds,
  handleSelectUsers,
  actionItems,
}: Props) {
  const rows = users;
  const columns = useMemo(
    () => [
      {
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Company",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        caption: "Action",
        width: ColumnWidths.Actions,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        visible: isRoleVisible,
        caption: "Role",
        dataField: "role",
        width: ColumnWidths.UserRole,
        calculateCellValue: ({ role }: Users) =>
          UserRoleToLabel[role as UserRolesEnum],
      },
      {
        caption: "First Name",
        dataField: "first_name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Last Name",
        dataField: "last_name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "email",
        caption: "Email",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "phone_number",
        caption: "Phone Number",
        minWidth: ColumnWidths.PhoneNumber,
      },
    ],
    [isCompanyVisible, isRoleVisible, actionItems]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectUsers && handleSelectUsers(selectedRowsData as Users[]),
    [handleSelectUsers]
  );

  return (
    <ControlledDataGrid
      pager={pager}
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedUserIds}
      onSelectionChanged={handleSelectionChanged}
      isExcelExport={isExcelExport}
    />
  );
}
