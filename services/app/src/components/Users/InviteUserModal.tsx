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
import { UserRolesEnum, UsersInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createBankCustomerUserMutation } from "lib/api/users";
import { UserRoleToLabel } from "lib/enum";
import { isEmailValid } from "lib/validation";
import { useState } from "react";

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
  // companyId == null when inviting a bank user.
  companyId: string | null;
  userRoles: UserRolesEnum[];
  handleClose: () => void;
}

export default function InviteUserModal({
  companyId,
  userRoles,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [user, setUser] = useState<UsersInsertInput>({
    company_id: companyId,
    role: null,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [createBankCustomerUser, { loading: isCreateBankCustomerUserLoading }] =
    useCustomMutation(createBankCustomerUserMutation);

  const handleClickSubmit = async () => {
    const response = await createBankCustomerUser({
      variables: {
        company_id: companyId,
        user: {
          company_id: companyId,
          role: user.role,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
        } as UsersInsertInput,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not create user. Error: ${response.msg}`);
    } else {
      if (user.role === UserRolesEnum.CompanyContactOnly) {
        snackbar.showSuccess("User created.");
      } else {
        snackbar.showSuccess("User created and sent a welcome email.");
      }
      handleClose();
    }
  };

  const isSubmitDisabled =
    !user.role ||
    !user.first_name ||
    !user.last_name ||
    !user.email ||
    !isEmailValid(user.email) ||
    isCreateBankCustomerUserLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Create User</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" mt={4}>
            <FormControl>
              <InputLabel id="user-role-select-label">User Role</InputLabel>
              <Select
                required
                labelId="user-role-select-label"
                value={user.role || ""}
                onChange={({ target: { value } }) => {
                  setUser({ ...user, role: value as UserRolesEnum });
                }}
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
              required
              label="First Name"
              value={user.first_name}
              onChange={({ target: { value } }) =>
                setUser({
                  ...user,
                  first_name: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              required
              label="Last Name"
              value={user.last_name}
              onChange={({ target: { value } }) =>
                setUser({
                  ...user,
                  last_name: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              required
              label="Email"
              error={!!user.email && !isEmailValid(user.email)}
              value={user.email}
              onChange={({ target: { value } }) =>
                setUser({
                  ...user,
                  email: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <PhoneInput
              isRequired
              value={user.phone_number || null}
              handleChange={(value) =>
                setUser({
                  ...user,
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
            disabled={isSubmitDisabled}
            className={classes.submitButton}
            onClick={handleClickSubmit}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
