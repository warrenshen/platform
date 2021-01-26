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
import EditUserProfile from "components/Shared/Users/EditUserProfile";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useCompanyForCustomerQuery,
  UserFragment,
  useUserByIdQuery,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext, useState } from "react";
import { useTitle } from "react-use";

const useStyles = makeStyles({
  label: {
    width: 130,
    color: grey[600],
  },
});

function UserProfile() {
  useTitle("Users | Profile");
  useAppBarTitle("User Profile");

  const classes = useStyles();

  const { user: currentUser } = useContext(CurrentUserContext);

  const [open, setOpen] = useState(false);

  const { data } = useUserByIdQuery({
    variables: {
      id: currentUser.id,
    },
  });

  const companyRes = useCompanyForCustomerQuery({
    variables: {
      companyId: currentUser.companyId,
    },
  });
  const companyData = companyRes.data;

  const user: Maybe<UserFragment> = data?.users_by_pk;

  return (
    <>
      {user && open && (
        <EditUserProfile
          companyId={currentUser.companyId}
          userId={currentUser.id}
          originalUserProfile={user}
          handleClose={() => setOpen(false)}
        ></EditUserProfile>
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
                <Box>{companyData?.companies_by_pk?.name}</Box>
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
    </>
  );
}

export default UserProfile;
