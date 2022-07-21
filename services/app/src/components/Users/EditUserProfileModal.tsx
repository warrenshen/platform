import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserFragment, UserRolesEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateUser } from "lib/api/users";
import {
  BespokeCompanyRole,
  BespokeCompanyRoleToLabel,
  BespokeCompanyRoles,
  UserRoleToLabel,
} from "lib/enum";
import { isEmailValid } from "lib/validation";
import { useContext, useState } from "react";

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
  isCompanyRoleVisible?: boolean;
  userRoles: UserRolesEnum[];
  originalUserProfile: UserFragment;
  handleClose: () => void;
}

function EditUserProfileModal({
  isCompanyRoleVisible = false,
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
  const [updateUserDetails, { loading: isUpdateUserLoading }] =
    useCustomMutation(updateUser);

  const handleSubmit = async () => {
    const response = await updateUserDetails({
      variables: {
        id: userProfile.id,
        role: userProfile.role,
        company_role: userProfile.company_role,
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
    !isEmailValid(userProfile.email) ||
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
          {isCompanyRoleVisible && (
            <Box display="flex" flexDirection="column" mt={4}>
              <FormControl>
                <InputLabel id="user-company-role-select-label">
                  Company Role
                </InputLabel>
                <Select
                  required
                  labelId="user-company-role-select-label"
                  value={userProfile.company_role || ""}
                  onChange={({ target: { value } }) =>
                    setUserProfile({
                      ...userProfile,
                      company_role: value as BespokeCompanyRole,
                    })
                  }
                >
                  {BespokeCompanyRoles.map((companyRole) => (
                    <MenuItem key={companyRole} value={companyRole}>
                      {BespokeCompanyRoleToLabel[companyRole]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

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
