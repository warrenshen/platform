import { Box, Button } from "@material-ui/core";
import InviteUserModal from "components/Shared/Users/InviteUserModal";
import ListUsers from "components/Shared/Users/ListUsers";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import {
  useListUsersByCompanyIdQuery,
  useListUsersByRoleQuery,
  UserFragment,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext, useState } from "react";
import { useTitle } from "react-use";

function Users() {
  useTitle("Users | Bespoke");
  useAppBarTitle("Users");

  const [open, setOpen] = useState(false);
  const currentUserFromContext = useContext(CurrentUserContext);
  const { data: customerUsers } = useListUsersByCompanyIdQuery({
    variables: {
      companyId: currentUserFromContext.user.companyId,
    },
  });

  const { data: bankUsers } = useListUsersByRoleQuery({
    variables: {
      role: currentUserFromContext.user.role,
    },
  });

  const users: Maybe<UserFragment[]> =
    currentUserFromContext.user.role === UserRole.BankAdmin
      ? bankUsers?.users
      : customerUsers?.users;

  return (
    <>
      {open && (
        <InviteUserModal
          companyId={
            currentUserFromContext.user.role === UserRole.BankAdmin
              ? undefined
              : currentUserFromContext.user.companyId
          }
          handleClose={() => setOpen(false)}
        ></InviteUserModal>
      )}
      <Box display="flex" flexDirection="row-reverse">
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color="primary"
        >
          Invite User
        </Button>
      </Box>

      <ListUsers
        companyId={currentUserFromContext.user.companyId}
        users={users}
      ></ListUsers>
    </>
  );
}

export default Users;
