import {
  Box,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { Alert } from "@mui/material";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
import Can from "components/Shared/Can";
import DeactivateUserModal from "components/Users/DeactivateUserModal";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import ReactivateUserModal from "components/Users/ReactivateUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ParentCompanies,
  Users,
  useGetDeactivatedUsersForParentCompanyQuery,
  useGetParentCompanyWithChildCompaniesQuery,
  useGetUsersForParentCompanyQuery,
} from "generated/graphql";
import { useFilterUserByCompanyName } from "hooks/useFilterUsers";
import { SearchIcon, WhitePlusIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import { getCompanyUserRolesFromChildCompanies } from "lib/companies";
import { PlatformModeEnum } from "lib/enum";
import { useContext, useMemo, useState } from "react";

import CreateParentCompanyUserModal from "./CreateParentCompanyUserModal";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

interface ActiveUsersTabProps {
  parentCompanyId: ParentCompanies["id"];
}

interface DeactivatedUsersTabProps {
  parentCompanyId: ParentCompanies["id"];
}

function ActiveUsersTab({ parentCompanyId }: ActiveUsersTabProps) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const { data, refetch } = useGetUsersForParentCompanyQuery({
    variables: {
      parent_company_id: parentCompanyId,
      isBankUser: isBankUser,
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

  const { data: childData } = useGetParentCompanyWithChildCompaniesQuery({
    variables: {
      parent_company_id: parentCompanyId,
    },
  });

  const companyUserRoles = getCompanyUserRolesFromChildCompanies(
    childData?.parent_companies_by_pk?.child_companies || []
  );

  const [searchQuery, setSearchQuery] = useState("");

  const usersSortedByCompanyName = useFilterUserByCompanyName(searchQuery, data)
    .map((user) => ({
      ...user,
      company_name: user.company?.name || "",
    }))
    .sort((a, b) => a.company_name.localeCompare(b.company_name));

  const [isDeactivateUserModalOpen, setIsDeactivateUserModalOpen] =
    useState(false);
  const [isEditUserProfileModalOpen, setIsEditUserProfileModalOpen] =
    useState(false);

  return (
    <Box data-cy="active-tab">
      <TextField
        autoFocus
        label="Search"
        value={searchQuery}
        onChange={({ target: { value } }) => setSearchQuery(value)}
        style={{ width: 430 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Box>
        {isDeactivateUserModalOpen && (
          <DeactivateUserModal
            companyId={parentCompanyId}
            user={selectedUsers[0]}
            handleClose={() => {
              refetch();
              setIsDeactivateUserModalOpen(false);
            }}
          />
        )}
        {isEditUserProfileModalOpen && (
          <EditUserProfileModal
            userId={selectedUsers[0].id}
            userRoles={companyUserRoles}
            originalUserProfile={selectedUsers[0]}
            handleClose={() => {
              refetch();
              setIsEditUserProfileModalOpen(false);
              setSelectedUsers([]);
            }}
          />
        )}
      </Box>
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.ManipulateUser}>
          <Box>
            <PrimaryButton
              dataCy={"edit-user-button"}
              text={"Edit"}
              isDisabled={selectedUsers.length !== 1}
              onClick={() => setIsEditUserProfileModalOpen(true)}
            />
          </Box>
        </Can>
        <Can perform={Action.ManipulateUser}>
          <Box>
            <SecondaryWarningButton
              dataCy={"deactivate-user-button"}
              text={"Deactivate"}
              isDisabled={selectedUsers.length !== 1}
              onClick={() => setIsDeactivateUserModalOpen(true)}
            />
          </Box>
        </Can>
      </Box>
      <Box
        display="flex"
        mt={3}
        data-cy="parent-company-active-users-data-grid"
      >
        {users.length > 0 ? (
          <UsersDataGrid
            isMultiSelectEnabled
            isRoleVisible
            users={usersSortedByCompanyName}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
            isCustomerUserGrid={true}
          />
        ) : (
          <Typography variant="body2">No users set up yet</Typography>
        )}
      </Box>
      <Box mt={2}>
        <Alert severity="info">
          Users are shared among all companies in the same parent company.
        </Alert>
      </Box>
    </Box>
  );
}

function DeactivatedUsersTab({ parentCompanyId }: DeactivatedUsersTabProps) {
  const { data, refetch } = useGetDeactivatedUsersForParentCompanyQuery({
    variables: {
      parent_company_id: parentCompanyId,
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

  const [isReactivateUserModalOpen, setIsReactivateUserModalOpen] =
    useState(false);

  return (
    <Box data-cy="deactivated-tab">
      {isReactivateUserModalOpen && (
        <ReactivateUserModal
          companyId={parentCompanyId}
          user={selectedUsers[0]}
          handleClose={() => {
            setIsReactivateUserModalOpen(false);
            refetch();
          }}
        />
      )}
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.ManipulateUser}>
          <Box>
            <PrimaryButton
              isDisabled={selectedUsers.length !== 1}
              dataCy={"reactivate-user-button"}
              text={"Re-activate"}
              onClick={() => setIsReactivateUserModalOpen(true)}
            />
          </Box>
        </Can>
      </Box>
      <Box
        display="flex"
        mt={3}
        data-cy="parent-company-deactivated-users-data-grid"
      >
        {users.length > 0 ? (
          <UsersDataGrid
            isMultiSelectEnabled
            isRoleVisible
            users={users}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
            isCustomerUserGrid={true}
          />
        ) : (
          <Typography variant="body2">No deactivated users to show</Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ManageUsersArea({ parentCompanyId }: Props) {
  const { data } = useGetParentCompanyWithChildCompaniesQuery({
    variables: {
      parent_company_id: parentCompanyId,
    },
  });

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const companyUserRoles = getCompanyUserRolesFromChildCompanies(
    data?.parent_companies_by_pk?.child_companies || []
  );
  const [isCreateUserProfileModalOpen, setIsCreateUserProfileModalOpen] =
    useState(false);

  return (
    <Box>
      <Box>
        {isCreateUserProfileModalOpen && (
          <CreateParentCompanyUserModal
            parentCompanyId={parentCompanyId}
            userRoles={companyUserRoles}
            handleClose={() => setIsCreateUserProfileModalOpen(false)}
          />
        )}
      </Box>
      <Box display={"flex"} flexDirection={"row-reverse"}>
        <Can perform={Action.ManipulateUser}>
          <PrimaryButton
            icon={<WhitePlusIcon />}
            dataCy={"create-user-button"}
            text={"Create User"}
            onClick={() => setIsCreateUserProfileModalOpen(true)}
          />
        </Can>
      </Box>
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active" data-cy="active-tab" />
        <Tab label="Deactivated" data-cy="deactived-tab" />
      </Tabs>
      <br />
      {selectedTabIndex === 0 ? (
        <ActiveUsersTab parentCompanyId={parentCompanyId} />
      ) : (
        <DeactivatedUsersTab parentCompanyId={parentCompanyId} />
      )}
    </Box>
  );
}
