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
import PageContent from "components/Shared/Page/PageContent";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { useUserByIdQuery } from "generated/graphql";
import { BankUserRoles, CompanyUserRoles } from "lib/enum";
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
  const isBankUser = isRoleBankUser(currentUser?.role);

  const [open, setOpen] = useState(false);

  const { data, refetch } = useUserByIdQuery({
    variables: {
      id: currentUser.id,
    },
  });

  const user = data?.users_by_pk;

  return (
    <Page appBarTitle={"Users"}>
      <PageContent title={"Users"}>
        {user && open && (
          <EditUserProfileModal
            userId={user.id}
            userRoles={isBankUser ? BankUserRoles : CompanyUserRoles}
            originalUserProfile={user}
            handleClose={() => {
              refetch();
              setOpen(false);
            }}
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
                    {isRoleBankUser(user?.role)
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
      </PageContent>
    </Page>
  );
}

export default UserProfile;
