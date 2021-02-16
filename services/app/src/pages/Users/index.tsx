import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Page from "components/Shared/Page";
import EditUserProfileModal from "components/Shared/Users/EditUserProfileModal";
import InviteUserModal from "components/Shared/Users/InviteUserModal";
import UsersDataGrid from "components/Shared/Users/UsersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useListUsersByCompanyIdQuery,
  useListUsersByRoleQuery,
  UserFragment,
  UserRolesEnum,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { useContext, useState } from "react";

function Users() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(CurrentUserContext);
  const [selectedUser, setSelectedUser] = useState({} as UserFragment);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  const { data: customerUsers } = useListUsersByCompanyIdQuery({
    variables: {
      companyId: user.companyId,
    },
  });

  const { data: bankUsers } = useListUsersByRoleQuery({
    variables: {
      role: user.role,
    },
  });

  const users: Maybe<UserFragment[]> =
    user.role === UserRolesEnum.BankAdmin
      ? bankUsers?.users
      : customerUsers?.users;

  return (
    <Page appBarTitle={"Users"}>
      {open && (
        <InviteUserModal
          companyId={
            user.role === UserRolesEnum.BankAdmin ? undefined : user.companyId
          }
          userRole={
            user.role === UserRolesEnum.BankAdmin
              ? UserRolesEnum.BankAdmin
              : UserRolesEnum.CompanyAdmin
          }
          handleClose={() => setOpen(false)}
        />
      )}
      {isEditUserModalOpen && (
        <EditUserProfileModal
          userId={user.id}
          companyId={user.companyId}
          originalUserProfile={selectedUser}
          handleClose={() => setIsEditUserModalOpen(false)}
        />
      )}
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        flexDirection="row-reverse"
      >
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color="primary"
        >
          Invite User
        </Button>
      </Box>
      <UsersDataGrid
        actionItems={[
          {
            key: "edit-user-profile-modal",
            label: "Edit",
            handleClick: (params: ValueFormatterParams) => {
              setIsEditUserModalOpen(true);
              setSelectedUser(params.row.data);
            },
          },
        ]}
        hideCompany={user.role !== UserRolesEnum.BankAdmin}
        users={users}
      />
    </Page>
  );
}

export default Users;
