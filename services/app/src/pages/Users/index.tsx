import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Page from "components/Shared/Page";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useGetUsersByRolesQuery,
  useListUsersByCompanyIdQuery,
  UserFragment,
  UserRolesEnum,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { Maybe } from "graphql/jsutils/Maybe";
import { useContext, useState } from "react";

function Users() {
  const [open, setOpen] = useState(false);
  const {
    user: { companyId, role, id },
  } = useContext(CurrentUserContext);
  const [selectedUser, setSelectedUser] = useState({} as UserFragment);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // TODO (warrenshen): Restructure this component to
  // render a separate bank vs customer component such that
  // this component does not invoke two queries when it only
  // needs to invoke one.
  const {
    data: customerUsers,
    refetch: refetchCustomerUsers,
  } = useListUsersByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  const {
    data: bankUsers,
    refetch: refetchBankUsers,
  } = useGetUsersByRolesQuery({
    variables: {
      roles: [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly],
    },
  });

  const users: Maybe<UserFragment[]> =
    role === UserRolesEnum.BankAdmin ? bankUsers?.users : customerUsers?.users;

  return (
    <Page appBarTitle={"Users"}>
      {open && (
        <InviteUserModal
          companyId={role === UserRolesEnum.BankAdmin ? undefined : companyId}
          userRoles={
            role === UserRolesEnum.BankAdmin
              ? [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]
              : [UserRolesEnum.CompanyAdmin, UserRolesEnum.CompanyReadOnly]
          }
          handleClose={() => {
            refetchCustomerUsers();
            refetchBankUsers();
            setOpen(false);
          }}
        />
      )}
      {isEditUserModalOpen && (
        <EditUserProfileModal
          userId={id}
          companyId={companyId}
          originalUserProfile={selectedUser}
          handleClose={() => {
            refetchCustomerUsers();
            refetchBankUsers();
            setIsEditUserModalOpen(false);
          }}
        />
      )}
      <Can perform={Action.ManipulateUser}>
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
      </Can>
      <UsersDataGrid
        hideCompany={
          ![UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly].includes(role)
        }
        actionItems={
          check(role, Action.ManipulateUser)
            ? [
                {
                  key: "edit-user-profile-modal",
                  label: "Edit",
                  handleClick: (params: ValueFormatterParams) => {
                    setIsEditUserModalOpen(true);
                    setSelectedUser(params.row.data);
                  },
                },
              ]
            : []
        }
        users={users}
      />
    </Page>
  );
}

export default Users;
