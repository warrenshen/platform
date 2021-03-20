import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { UserFragment, Users } from "generated/graphql";
import { useMemo } from "react";

interface Props {
  isMultiSelectEnabled?: boolean;
  hideCompany?: boolean;
  isExcelExport?: boolean;
  users: UserFragment[];
  selectedUserIds?: Users["id"][];
  handleSelectUsers?: (users: Users[]) => void;
  actionItems?: DataGridActionItem[];
}

function UsersDataGrid({
  isMultiSelectEnabled = false,
  hideCompany,
  isExcelExport = false,
  users,
  selectedUserIds,
  handleSelectUsers,
  actionItems,
}: Props) {
  const rows = users;
  const columns = useMemo(
    () => [
      {
        visible: !hideCompany,
        dataField: "company_name",
        caption: "Company",
        width: 200,
      },
      {
        caption: "Role",
        dataField: "role",
        width: 150,
      },
      {
        dataField: "first_name",
        caption: "First Name",
      },
      {
        dataField: "last_name",
        caption: "Last Name",
      },
      {
        dataField: "email",
        caption: "Email",
        width: 270,
      },
      {
        dataField: "phone_number",
        caption: "Phone Number",
        width: 150,
      },
      {
        visible: !!actionItems && actionItems.length > 0,
        caption: "Action",
        width: 90,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
    ],
    [hideCompany, actionItems]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectUsers && handleSelectUsers(selectedRowsData as Users[]),
    [handleSelectUsers]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        select={isMultiSelectEnabled}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedUserIds}
        onSelectionChanged={handleSelectionChanged}
        isExcelExport={isExcelExport}
      />
    </Box>
  );
}

export default UsersDataGrid;
