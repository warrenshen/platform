import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  UserByIdDocument,
  UserFragment,
  useUpdateUserMutation,
} from "generated/graphql";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      paddingLeft: theme.spacing(4),
      borderBottom: "1px solid #c7c7c7",
    },
    usersInput: {
      margin: theme.spacing(1),
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  userId: string;
  originalUserProfile: UserFragment;
  handleClose: () => void;
}

function EditUserProfile({ userId, originalUserProfile, handleClose }: Props) {
  const classes = useStyles();

  const [userProfile, setUserProfile] = useState(originalUserProfile);

  const [updateUser] = useUpdateUserMutation();

  return (
    <Dialog open onClose={handleClose} maxWidth="xl">
      <DialogTitle className={classes.dialogTitle}>
        Edit user profile
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <TextField
            label="First Name"
            className={classes.usersInput}
            value={userProfile.first_name}
            onChange={({ target: { value } }) => {
              setUserProfile({
                ...userProfile,
                first_name: value,
              });
            }}
          ></TextField>
          <TextField
            label="Last Name"
            className={classes.usersInput}
            value={userProfile.last_name}
            onChange={({ target: { value } }) => {
              setUserProfile({
                ...userProfile,
                last_name: value,
              });
            }}
          ></TextField>
          <TextField
            disabled={true}
            label="Email"
            className={classes.usersInput}
            value={userProfile.email}
            onChange={({ target: { value } }) => {
              setUserProfile({
                ...userProfile,
                email: value,
              });
            }}
          ></TextField>
          <TextField
            label="Phone Number"
            className={classes.usersInput}
            value={userProfile.phone_number}
            onChange={({ target: { value } }) => {
              setUserProfile({
                ...userProfile,
                phone_number: value,
              });
            }}
          ></TextField>
          <TextField
            disabled={true}
            label="Role"
            className={classes.usersInput}
            value={userProfile.role}
            onChange={({ target: { value } }) => {
              setUserProfile({
                ...userProfile,
                role: value,
              });
            }}
          ></TextField>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={!userProfile.first_name || !userProfile.last_name}
            onClick={async () => {
              const { email, role, full_name, ...userSet } = userProfile;
              await updateUser({
                variables: {
                  id: userId,
                  user: userSet,
                },
                refetchQueries: [
                  {
                    query: UserByIdDocument,
                    variables: {
                      id: userId,
                    },
                  },
                ],
              });
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserProfile;
