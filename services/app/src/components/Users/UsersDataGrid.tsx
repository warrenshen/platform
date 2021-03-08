import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { UserFragment } from "generated/graphql";
import { useMemo } from "react";

interface Props {
  hideCompany?: boolean;
  users: UserFragment[];
  actionItems: DataGridActionItem[];
}

function UsersDataGrid({ actionItems, hideCompany, users }: Props) {
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
        visible: actionItems.length > 0,
        caption: "Action",
        width: 90,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
    ],
    [hideCompany, actionItems]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid pager dataSource={rows} columns={columns} />
    </Box>
  );
}

export default UsersDataGrid;
