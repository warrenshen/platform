import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import Page from "components/Shared/Page";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum, useUserByIdQuery } from "generated/graphql";
import { useContext, useState } from "react";

const useStyles = makeStyles({
  label: {
    width: 130,
    color: grey[600],
  },
});

function UserProfile() {
  const classes = useStyles();

  const { user: currentUser } = useContext(CurrentUserContext);

  const [open, setOpen] = useState(false);

  const { data } = useUserByIdQuery({
    variables: {
      id: currentUser.id,
    },
  });

  const user = data?.users_by_pk;

  return (
    <Page appBarTitle={"Users"}>
      {user && open && (
        <EditUserProfileModal
          companyId={currentUser.companyId}
          userId={currentUser.id}
          originalUserProfile={user}
          handleClose={() => setOpen(false)}
        />
      )}
      <Box display="flex">
        <Card>
          <CardContent>
            <Typography variant="h6">User Profile Info</Typography>
            <Box py={3}>
              <Box display="flex" pb={0.25}>
                <Box className={classes.label}>First Name</Box>
                <Box>{user?.first_name}</Box>
              </Box>
              <Box display="flex" pb={0.25}>
                <Box className={classes.label}>Last Name</Box>
                <Box>{user?.last_name}</Box>
              </Box>
              <Box display="flex" pb={0.25}>
                <Box className={classes.label}>Email</Box>
                <Box>{user?.email}</Box>
              </Box>
              <Box display="flex" pb={0.25}>
                <Box className={classes.label}>Phone Number</Box>
                <Box>{user?.phone_number}</Box>
              </Box>
              <Box display="flex" pb={0.25}>
                <Box className={classes.label}>Company</Box>
                <Box>
                  {user?.role === UserRolesEnum.BankAdmin
                    ? "Bespoke (Bank)"
                    : user?.company?.name}
                </Box>
              </Box>
              <Box display="flex" pb={0.25}>
                <Box className={classes.label}>Role</Box>
                <Box>{user?.role}</Box>
              </Box>
            </Box>
          </CardContent>
          <CardActions>
            <Button
              onClick={() => {
                setOpen(true);
              }}
              variant="outlined"
              size="small"
            >
              Edit
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Page>
  );
}

export default UserProfile;
