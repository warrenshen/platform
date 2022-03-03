import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserFragment, UserRolesEnum } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { UserRoleToLabel } from "lib/enum";
import { useContext, useState } from "react";
import useCustomMutation from "hooks/useCustomMutation";
import { updateUser } from "lib/api/users";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
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
  userRoles: UserRolesEnum[];
  originalUserProfile: UserFragment;
  handleClose: () => void;
}

function EditUserProfileModal({
  userId,
  userRoles,
  originalUserProfile,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [userProfile, setUserProfile] = useState(originalUserProfile);

  const [
    updateUserDetails,
    { loading: isUpdateUserLoading },
  ] = useCustomMutation(updateUser);

  const handleSubmit = async () => {
    const response = await updateUserDetails({
      variables: {
        id: userProfile.id,
        role: userProfile.role,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        phone_number: userProfile.phone_number,
        email: userProfile.email,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("User details updated.");
      handleClose();
    }
  };

  const updateButtonDisabled =
    !userProfile.role ||
    !userProfile.first_name ||
    !userProfile.last_name ||
    !userProfile.email ||
    isUpdateUserLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Edit User</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" mt={4}>
            <FormControl>
              <InputLabel id="user-role-select-label">Role</InputLabel>
              <Select
                disabled={role !== UserRolesEnum.BankAdmin} // ONLY bank ADMINs can edit role of a user.
                required
                labelId="user-role-select-label"
                value={userProfile.role || ""}
                onChange={({ target: { value } }) =>
                  setUserProfile({
                    ...userProfile,
                    role: value as UserRolesEnum,
                  })
                }
              >
                {userRoles.map((userRole) => (
                  <MenuItem key={userRole} value={userRole}>
                    {UserRoleToLabel[userRole]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="First Name"
              value={userProfile.first_name}
              onChange={({ target: { value } }) =>
                setUserProfile({
                  ...userProfile,
                  first_name: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Last Name"
              value={userProfile.last_name}
              onChange={({ target: { value } }) =>
                setUserProfile({
                  ...userProfile,
                  last_name: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Email"
              value={userProfile.email}
              onChange={({ target: { value } }) =>
                setUserProfile({
                  ...userProfile,
                  email: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <PhoneInput
              value={userProfile.phone_number || null}
              handleChange={(value) =>
                setUserProfile({
                  ...userProfile,
                  phone_number: value,
                })
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={updateButtonDisabled}
            onClick={handleSubmit}
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
