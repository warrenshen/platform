import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import Can from "components/Shared/Can";
import EditUserProfileModal from "components/Shared/Users/EditUserProfileModal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserFragment } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

interface Props {
  companyId: string;
  users?: UserFragment[];
}

function ListUsers({ companyId, users }: Props) {
  const currentUserFromContext = useContext(CurrentUserContext);

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({} as UserFragment);

  return (
    <>
      {open && (
        <EditUserProfileModal
          userId={currentUserFromContext.user.id}
          companyId={companyId}
          originalUserProfile={selectedUser}
          handleClose={() => setOpen(false)}
        ></EditUserProfileModal>
      )}
      <Box display="flex">
        {users?.map((user, index) => {
          return (
            <Box key={index} display="flex" mr={2} mt={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{`${user?.first_name} ${user?.last_name}`}</Typography>
                  <Box py={3}>
                    <Box display="flex" pb={0.25}>
                      <Box>{user?.email}</Box>
                    </Box>
                    <Box display="flex" pb={0.25}>
                      <Box>{user?.phone_number}</Box>
                    </Box>
                    <Box display="flex" pb={0.25}>
                      <Box>{user?.role}</Box>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Can perform={Action.ManipulateUser} userIdForCheck={user.id}>
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setOpen(true);
                      }}
                      size="small"
                    >
                      See more
                    </Button>
                  </Can>
                </CardActions>
              </Card>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export default ListUsers;
