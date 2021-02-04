import { Box, Button } from "@material-ui/core";
import Page from "components/Shared/Page";
import InviteUserModal from "components/Shared/Users/InviteUserModal";
import ListUsers from "components/Shared/Users/ListUsers";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useListUsersByCompanyIdQuery,
  useListUsersByRoleQuery,
  UserFragment,
  UserRolesEnum,
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
    currentUserFromContext.user.role === UserRolesEnum.BankAdmin
      ? bankUsers?.users
      : customerUsers?.users;

  return (
    <Page>
      {open && (
        <InviteUserModal
          companyId={
            currentUserFromContext.user.role === UserRolesEnum.BankAdmin
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
    </Page>
  );
}

export default Users;
