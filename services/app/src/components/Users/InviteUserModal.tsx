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
import { UserRolesEnum, UsersInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createBankCustomerUserMutation } from "lib/api/users";
import { UserRoleToLabel } from "lib/enum";
import { useMemo, useState } from "react";

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

function InviteUserModal({ companyId, userRoles, handleClose }: Props) {
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
  const [errMsg, setErrMsg] = useState("");

  const [
    createBankCustomerUser,
    { loading: isCreateBankCustomerUserLoading },
  ] = useCustomMutation(createBankCustomerUserMutation);

  const isEmailValid = useMemo(
    () =>
      user.email &&
      user.email.length &&
      !!user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/gi),
    [user.email]
  );

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
      setErrMsg(response.msg);
      snackbar.showError(`Could not create user. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("User created and sent a welcome email.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !user.role ||
    !user.first_name ||
    !user.last_name ||
    !user.email ||
    !isEmailValid ||
    isCreateBankCustomerUserLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Invite New User</DialogTitle>
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
              onChange={({ target: { value } }) => {
                setUser({
                  ...user,
                  first_name: value,
                });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              required
              label="Last Name"
              value={user.last_name}
              onChange={({ target: { value } }) => {
                setUser({
                  ...user,
                  last_name: value,
                });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              required
              label="Email"
              error={!!user.email && !isEmailValid}
              value={user.email}
              onChange={({ target: { value } }) => {
                setUser({
                  ...user,
                  email: value,
                });
              }}
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
          {errMsg && <div>Error: {errMsg}</div>}
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

export default InviteUserModal;
