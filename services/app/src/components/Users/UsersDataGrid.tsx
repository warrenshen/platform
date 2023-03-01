import { Box, IconButton } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import EditIcon from "@material-ui/icons/Edit";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum, UserWrapperFragment, Users } from "generated/graphql";
import {
  BespokeCompanyRole,
  CustomerRoleEnum,
  CustomerRoleToLabel,
  PlatformModeEnum,
  UserRoleToLabel,
} from "lib/enum";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { Dispatch, SetStateAction, useContext, useMemo } from "react";

import { BespokeCompanyRoleToLabel } from "../../lib/enum";

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isRoleVisible?: boolean;
  isCompanyRoleVisible?: boolean;
  pager?: boolean;
  users: UserWrapperFragment[];
  selectedUserIds?: Users["id"][];
  handleSelectUsers?: (users: Users[]) => void;
  handleImpersonateClick?: (userId: Users["id"]) => void;
  actionItems?: DataGridActionItem[];
  setSelectedUserProfile?: Dispatch<SetStateAction<Users["id"]>>;
  isEditIconVisible?: boolean;
  isCustomerUserGrid?: boolean;
}

function getRows(users: UserWrapperFragment[]) {
  return users.map((user) => {
    return formatRowModel({
      ...user,
      customer_role_labels: user.hasOwnProperty("company_role_new")
        ? !!user?.company_role_new?.["customer_roles"]
          ? user.company_role_new["customer_roles"].map(
              (role: CustomerRoleEnum) => CustomerRoleToLabel[role]
            )
          : ""
        : "",
    });
  });
}

export default function UsersDataGrid({
  isCompanyVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  isRoleVisible = false,
  isCompanyRoleVisible = false,
  pager = true,
  users,
  selectedUserIds,
  handleSelectUsers,
  actionItems,
  setSelectedUserProfile,
  isEditIconVisible = false,
  isCustomerUserGrid = false,
}: Props) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const rows = useMemo(() => getRows(users), [users]);
  const columns = useMemo(
    () => [
      {
        visible: isEditIconVisible,
        width: ColumnWidths.IconButton,
        cellRender: (params: GridValueFormatterParams) => (
          <Box>
            <IconButton
              onClick={() => {
                if (!!setSelectedUserProfile) {
                  setSelectedUserProfile(params.row.data.id);
                }
              }}
              color={"primary"}
              size={"small"}
            >
              <EditIcon />
            </IconButton>
          </Box>
        ),
      },
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
        cellRender: (params: GridValueFormatterParams) => (
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
        visible: isCompanyRoleVisible,
        caption: "Company Role",
        dataField: "comapny_role",
        width: ColumnWidths.UserRole,
        calculateCellValue: ({ company_role }: Users) =>
          BespokeCompanyRoleToLabel[company_role as BespokeCompanyRole],
      },
      {
        visible: isCustomerUserGrid && isBankUser,
        caption: "New Role",
        dataField: "customer_role_labels",
        width: ColumnWidths.UserRole,
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
    [
      isBankUser,
      isCompanyVisible,
      isCompanyRoleVisible,
      isRoleVisible,
      actionItems,
      setSelectedUserProfile,
      isEditIconVisible,
      isCustomerUserGrid,
    ]
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
