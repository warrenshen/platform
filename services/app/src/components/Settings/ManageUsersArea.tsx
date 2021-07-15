import { Box, Tab, Tabs, Typography } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import DeactivateUserModal from "components/Users/DeactivateUserModal";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import ReactivateUserModal from "components/Users/ReactivateUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  useListDeactivatedUsersByCompanyIdQuery,
  useListUsersByCompanyIdQuery,
  Users,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { CompanyUserRoles } from "lib/enum";
import { useMemo, useState } from "react";

interface Props {
  companyId: string;
}

interface ActiveUsersTabProps {
  companyId: string;
}

interface DeactivatedUsersTabProps {
  companyId: string;
}

function ActiveUsersTab({ companyId }: ActiveUsersTabProps) {
  const { data, refetch } = useListUsersByCompanyIdQuery({
    variables: {
      companyId,
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
          <ModalButton
            isDisabled={selectedUsers.length > 0}
            label={"Create User"}
            modal={({ handleClose }) => (
              <InviteUserModal
                companyId={companyId}
                userRoles={CompanyUserRoles}
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
              label={"Edit User"}
              modal={({ handleClose }) => (
                <EditUserProfileModal
                  userId={selectedUsers[0].id}
                  userRoles={CompanyUserRoles}
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
              label={"Deactivate User"}
              modal={({ handleClose }) => (
                <DeactivateUserModal
                  companyId={companyId}
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

function DeactivatedUsersTab({ companyId }: DeactivatedUsersTabProps) {
  const { data, refetch } = useListDeactivatedUsersByCompanyIdQuery({
    variables: {
      companyId,
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
              label={"Re-activate User"}
              modal={({ handleClose }) => (
                <ReactivateUserModal
                  companyId={companyId}
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

export default function ManageUsersArea({ companyId }: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Box>
      <h2>Users</h2>
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
      {selectedTabIndex === 0 ? (
        <ActiveUsersTab companyId={companyId} />
      ) : (
        <DeactivatedUsersTab companyId={companyId} />
      )}
    </Box>
  );
}
