import { Box, Tab, Tabs, Typography } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import DeactivateUserModal from "components/Users/DeactivateUserModal";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import ReactivateUserModal from "components/Users/ReactivateUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  GetCompanyForCustomerQuery,
  Users,
  useGetDeactivatedUsersForCompanyQuery,
  useGetUsersForCompanyQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { getCompanyUserRolesForCompany } from "lib/companies";
import { useMemo, useState } from "react";

interface Props {
  company: NonNullable<GetCompanyForCustomerQuery["companies_by_pk"]>;
}

interface ActiveUsersTabProps {
  company: NonNullable<GetCompanyForCustomerQuery["companies_by_pk"]>;
}

interface DeactivatedUsersTabProps {
  company: NonNullable<GetCompanyForCustomerQuery["companies_by_pk"]>;
}

function ActiveUsersTab({ company }: ActiveUsersTabProps) {
  const { data, refetch } = useGetUsersForCompanyQuery({
    variables: {
      parent_company_id: company.parent_company_id,
      company_id: company.id,
    },
  });

  const users = data?.users || [];

  const [selectedUsers, setSelectedUsers] = useState<Users[]>([]);

  const selectedUserIds = useMemo(
    () => selectedUsers.map((user) => user.id),
    [selectedUsers]
  );

  const handleSelectUsers = useMemo(
    () => (users: Users[]) => {
      setSelectedUsers(users);
    },
    [setSelectedUsers]
  );

  const companyUserRoles = getCompanyUserRolesForCompany(company);

  return (
    <>
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.ManipulateUser}>
          <ModalButton
            isDisabled={selectedUsers.length > 0}
            label={"Create User"}
            modal={({ handleClose }) => (
              <InviteUserModal
                companyId={company.id}
                userRoles={companyUserRoles}
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
                  userRoles={companyUserRoles}
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
                  companyId={company.id}
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

function DeactivatedUsersTab({ company }: DeactivatedUsersTabProps) {
  const { data, refetch } = useGetDeactivatedUsersForCompanyQuery({
    variables: {
      parent_company_id: company.parent_company_id,
      company_id: company.id,
    },
  });

  const users = data?.users || [];

  const [selectedUsers, setSelectedUsers] = useState<Users[]>([]);

  const selectedUserIds = useMemo(
    () => selectedUsers.map((user) => user.id),
    [selectedUsers]
  );

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
                  companyId={company.id}
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

export default function ManageUsersArea({ company }: Props) {
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
        <ActiveUsersTab company={company} />
      ) : (
        <DeactivatedUsersTab company={company} />
      )}
    </Box>
  );
}
