import { Box, Tab, Tabs, Typography } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import DeactivateUserModal from "components/Users/DeactivateUserModal";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import ReactivateUserModal from "components/Users/ReactivateUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  useGetActiveUsersByRolesQuery,
  useGetDeactivedUsersByRolesQuery,
  Users,
  UserRolesEnum,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";

function ActiveUsersTab() {
  const { data, refetch } = useGetActiveUsersByRolesQuery({
    variables: {
      roles: [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly],
    },
  });

  const users = data?.users || [];

  const [selectedUsers, setSelectedUsers] = useState<Users[]>([]);

  const selectedUserIds = useMemo(() => selectedUsers.map((user) => user.id), [
    selectedUsers,
  ]);

  const handleSelectUsers = useMemo(
    () => (users: Users[]) => {
      setSelectedUsers(users);
    },
    [setSelectedUsers]
  );

  const bankUserRoles = [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly];

  return (
    <>
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.ManipulateUser}>
          <ModalButton
            isDisabled={selectedUsers.length > 0}
            label={"Create BF User"}
            modal={({ handleClose }) => (
              <InviteUserModal
                companyId={null}
                userRoles={bankUserRoles}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Can>
        <Can perform={Action.ManipulateUser}>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedUsers.length !== 1}
              label={"Edit BF User"}
              modal={({ handleClose }) => (
                <EditUserProfileModal
                  userId={selectedUsers[0].id}
                  userRoles={bankUserRoles}
                  originalUserProfile={selectedUsers[0]}
                  handleClose={() => {
                    refetch();
                    handleClose();
                    setSelectedUsers([]);
                  }}
                />
              )}
            />
          </Box>
        </Can>
        <Can perform={Action.ManipulateUser}>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedUsers.length !== 1}
              label={"Deactivate BF User"}
              modal={({ handleClose }) => (
                <DeactivateUserModal
                  companyId={null}
                  user={selectedUsers[0]}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Can>
      </Box>
      <Box display="flex" mt={3}>
        {users.length > 0 ? (
          <UsersDataGrid
            isMultiSelectEnabled
            isRoleVisible
            users={users}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
          />
        ) : (
          <Typography variant="body2">No users set up yet</Typography>
        )}
      </Box>
    </>
  );
}

function DeactivatedUsersTab() {
  const { data, refetch } = useGetDeactivedUsersByRolesQuery({
    variables: {
      roles: [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly],
    },
  });

  const users = data?.users || [];

  const [selectedUsers, setSelectedUsers] = useState<Users[]>([]);

  const selectedUserIds = useMemo(() => selectedUsers.map((user) => user.id), [
    selectedUsers,
  ]);

  const handleSelectUsers = useMemo(
    () => (users: Users[]) => {
      setSelectedUsers(users);
    },
    [setSelectedUsers]
  );

  return (
    <>
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.ManipulateUser}>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedUsers.length !== 1}
              label={"Re-activate BF User"}
              modal={({ handleClose }) => (
                <ReactivateUserModal
                  companyId={null}
                  user={selectedUsers[0]}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Can>
      </Box>
      <Box display="flex" mt={3}>
        {users.length > 0 ? (
          <UsersDataGrid
            isMultiSelectEnabled
            isRoleVisible
            users={users}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
          />
        ) : (
          <Typography variant="body2">No deactivated users to show</Typography>
        )}
      </Box>
    </>
  );
}

export default function ManageBankUsersArea() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Box>
      <h2>Bespoke Financial Users</h2>
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active Users" />
        <Tab label="Deactivated Users" />
      </Tabs>
      <br />
      {selectedTabIndex === 0 ? <ActiveUsersTab /> : <DeactivatedUsersTab />}
    </Box>
  );
}
