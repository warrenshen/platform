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
  UserFragment,
  UserRolesEnum,
  useUpdateUserMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    usersInput: {
      margin: theme.spacing(1),
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  userId: string;
  companyId: string;
  originalUserProfile: UserFragment;
  handleClose: () => void;
}

function EditUserProfileModal({
  userId,
  companyId,
  originalUserProfile,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [userProfile, setUserProfile] = useState(originalUserProfile);

  const [updateUser] = useUpdateUserMutation();

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Edit User Profile
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
          />
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
          />
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
          />
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
          />
          <TextField
            disabled={true}
            label="Role"
            className={classes.usersInput}
            value={userProfile.role}
            onChange={({ target: { value } }) => {
              let roleEnum = null;
              if (value === UserRolesEnum.BankAdmin) {
                roleEnum = UserRolesEnum.BankAdmin;
              } else if (value === UserRolesEnum.CompanyAdmin) {
                roleEnum = UserRolesEnum.CompanyAdmin;
              }

              if (!roleEnum) {
                return;
              }

              setUserProfile({
                ...userProfile,
                role: roleEnum,
              });
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={
              !userProfile.first_name ||
              !userProfile.last_name ||
              !userProfile.email
            }
            onClick={async () => {
              await updateUser({
                variables: {
                  id: userProfile.id,
                  user: {
                    first_name: userProfile.first_name,
                    last_name: userProfile.last_name,
                    phone_number: userProfile.phone_number,
                  },
                },
                optimisticResponse: {
                  update_users_by_pk: {
                    ...(userProfile as UserFragment),
                  },
                },
              });
              snackbar.showSuccess("Success! User updated.");
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

export default EditUserProfileModal;
