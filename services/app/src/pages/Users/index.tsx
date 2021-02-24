import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Page from "components/Shared/Page";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useGetUsersByRolesQuery,
  useListUsersByCompanyIdQuery,
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

  // TODO (warrenshen): Restructure this component to
  // render a separate bank vs customer component such that
  // this component does not invoke two queries when it only
  // needs to invoke one.
  const {
    data: customerUsers,
    refetch: refetchCustomerUsers,
  } = useListUsersByCompanyIdQuery({
    variables: {
      companyId: user.companyId,
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
          userRoles={
            user.role === UserRolesEnum.BankAdmin
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
          userId={user.id}
          companyId={user.companyId}
          originalUserProfile={selectedUser}
          handleClose={() => {
            refetchCustomerUsers();
            refetchBankUsers();
            setIsEditUserModalOpen(false);
          }}
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
        hideCompany={
          ![UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly].includes(
            user.role
          )
        }
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
        users={users}
      />
    </Page>
  );
}

export default Users;
