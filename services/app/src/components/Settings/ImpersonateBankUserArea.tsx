import { Box, Button, TextField, Typography } from "@material-ui/core";
import UsersDataGrid from "components/Users/UsersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  UserRolesEnum,
  Users,
  useGetActiveUsersByRolesQuery,
} from "generated/graphql";
import { useFilterUserByCompanyName } from "hooks/useFilterUsers";
import useSnackbar from "hooks/useSnackbar";
import { customerRoutes } from "lib/routes";
import { useContext, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

const ImpersonateBankUserArea = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const snackbar = useSnackbar();
  const history = useHistory();
  const { impersonateUser } = useContext(CurrentUserContext);
  const { data } = useGetActiveUsersByRolesQuery({
    variables: {
      roles: [UserRolesEnum.CompanyAdmin],
    },
  });

  const [selectedUsers, setSelectedUsers] = useState<Users[]>([]);
  const usersSortedByCompanyName = useFilterUserByCompanyName(searchQuery, data)
    .map((user) => ({
      ...user,
      company_name: user.company?.name || "",
    }))
    .sort((a, b) => a.company_name.localeCompare(b.company_name));

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

  const handleImpersonateClick = async () => {
    if (selectedUserIds?.length === 0) {
      return;
    }

    const errorMsg = await impersonateUser(selectedUserIds[0]);

    if (errorMsg) {
      return snackbar.showError("Could not impersonate user: ", errorMsg);
    }
    history.push(customerRoutes.overview);
  };

  return (
    <Box>
      <Typography variant="h6">
        <strong>Customer Users</strong>
      </Typography>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box display="flex">
          <TextField
            autoFocus
            label="Search company name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 430 }}
          />
        </Box>

        <Button
          data-cy={"impersonate-user-button"}
          disabled={selectedUsers.length !== 1}
          color="primary"
          size="medium"
          variant="contained"
          onClick={handleImpersonateClick}
        >
          Impersonate User
        </Button>
      </Box>
      <Box data-cy={"impersonate-users-data-grid"} display="flex" mt={3}>
        {data?.users?.length ? (
          <UsersDataGrid
            isMultiSelectEnabled
            isRoleVisible
            isCompanyVisible
            users={usersSortedByCompanyName}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
          />
        ) : (
          <Typography variant="body2">No users set up yet</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ImpersonateBankUserArea;
