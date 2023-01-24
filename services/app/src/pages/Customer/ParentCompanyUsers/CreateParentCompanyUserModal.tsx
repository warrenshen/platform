import {
  Box,
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
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import { UserRolesEnum, UsersInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createParentCompanyUserMutation } from "lib/api/users";
import {
  BespokeCompanyRole,
  BespokeCompanyRoleToLabel,
  BespokeCompanyRoles,
  UserRoleToLabel,
} from "lib/enum";
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
  parentCompanyId: string | null;
  isCompanyRoleVisible?: boolean;
  userRoles: UserRolesEnum[];
  handleClose: () => void;
}

export default function CreateParentCompanyUserModal({
  parentCompanyId,
  isCompanyRoleVisible = false,
  userRoles,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [user, setUser] = useState<UsersInsertInput>({
    parent_company_id: parentCompanyId,
    role: null,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [
    createParentCompanyUser,
    { loading: isCreateParentCompanyUserLoading },
  ] = useCustomMutation(createParentCompanyUserMutation);

  const handleClickSubmit = async () => {
    const response = await createParentCompanyUser({
      variables: {
        parent_company_id: parentCompanyId,
        user: {
          parent_company_id: parentCompanyId,
          company_role: user.company_role,
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
    !user.phone_number ||
    !user.email ||
    !isEmailValid(user.email) ||
    isCreateParentCompanyUserLoading;

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
          {isCompanyRoleVisible && (
            <Box display="flex" flexDirection="column" mt={4}>
              <FormControl>
                <InputLabel id="user-role-select-label">
                  Company Role
                </InputLabel>
                <Select
                  required
                  labelId="company-role-select-label"
                  value={user.company_role || ""}
                  onChange={({ target: { value } }) => {
                    setUser({
                      ...user,
                      company_role: value as BespokeCompanyRole,
                    });
                  }}
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
              data-cy="create-parent-company-user-modal-first-name"
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
              data-cy="create-parent-company-user-modal-last-name"
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
              data-cy="create-parent-company-user-modal-email"
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
              dataCy="create-parent-company-user-modal-phone-number"
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
          <Box display="flex" flexDirection="column" mt={4}>
            <FormControl>
              <InputLabel id="user-role-select-label">User Role</InputLabel>
              <Select
                data-cy={"create-parent-company-user-modal-role-select"}
                required
                labelId="user-role-select-label"
                value={user.role || ""}
                onChange={({ target: { value } }) => {
                  setUser({ ...user, role: value as UserRolesEnum });
                }}
              >
                {userRoles.map((userRole) => (
                  <MenuItem
                    data-cy={`user-role-select-item-${UserRoleToLabel[userRole]}`
                      .replace(/\s+/g, "-")
                      .toLowerCase()}
                    key={userRole}
                    value={userRole}
                  >
                    {UserRoleToLabel[userRole]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display={"flex"}>
          <SecondaryButton onClick={handleClose} text="Cancel" />
          <PrimaryButton
            dataCy="create-parent-company-user-modal-submit"
            isDisabled={isSubmitDisabled}
            onClick={handleClickSubmit}
            text="Submit"
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
