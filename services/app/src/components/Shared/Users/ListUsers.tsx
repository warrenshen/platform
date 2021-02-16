import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { UserFragment } from "generated/graphql";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
interface Props {
  hideCompany?: boolean;
  actionItems: DataGridActionItem[];
  users?: UserFragment[];
}

function ListUsers({ actionItems, hideCompany, users }: Props) {
  const columns = [
    ...(!hideCompany
      ? [
          {
            dataField: "company_name",
            caption: "Company",
            width: 200,
          },
        ]
      : []),
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
      caption: "Action",
      width: 90,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      {users && (
        <ControlledDataGrid
          dataSource={users}
          columns={columns}
          pager
          pageSize={30}
          allowedPageSizes={[30]}
        ></ControlledDataGrid>
      )}
    </Box>
  );
}

export default ListUsers;
