import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum, UserWrapperFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateUser } from "lib/api/users";
import {
  BespokeCompanyRole,
  BespokeCompanyRoleToLabel,
  BespokeCompanyRoles,
  CustomerRoleEnum,
  CustomerRoleToLabel,
  UserRoleToLabel,
} from "lib/enum";
import { isEmailValid } from "lib/validation";
import { ChangeEvent, useContext, useState } from "react";

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
  originalUserProfile: UserWrapperFragment;
  handleClose: () => void;
  isEditBankUser?: Boolean;
}

function EditUserProfileModal({
  isCompanyRoleVisible = false,
  userRoles,
  originalUserProfile,
  handleClose,
  isEditBankUser = false,
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
    const selectedRoles = Object.entries(selectionState)
      .map((state) => {
        return state[1] ? state[0] : null;
      })
      .filter((state) => !!state);
    const response = await updateUserDetails({
      variables: {
        id: userProfile.id,
        role: userProfile.role,
        company_role: userProfile.company_role,
        company_role_new: selectedRoles,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        phone_number: userProfile.phone_number,
        email: userProfile.email,
        other_role: otherRole,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("User details updated.");
      handleClose();
    }
  };

  const supportedCompanyRoles = userProfile.hasOwnProperty("company_role_new")
    ? !!userProfile?.company_role_new?.["customer_roles"]
      ? userProfile.company_role_new["customer_roles"]
      : []
    : [];
  const [otherRole, setOtherRole] = useState(
    userProfile.hasOwnProperty("company_role_new")
      ? !!userProfile?.company_role_new?.["other_role"]
        ? userProfile.company_role_new["other_role"]
        : []
      : ""
  );

  const [selectionState, setSelectionState] = useState<Record<string, boolean>>(
    {
      [CustomerRoleEnum.Financials]: supportedCompanyRoles.includes(
        CustomerRoleEnum.Financials
      ),
      [CustomerRoleEnum.PurchaseOrderEdits]: supportedCompanyRoles.includes(
        CustomerRoleEnum.PurchaseOrderEdits
      ),
      [CustomerRoleEnum.Repayments]: supportedCompanyRoles.includes(
        CustomerRoleEnum.Repayments
      ),
      [CustomerRoleEnum.Executive]: supportedCompanyRoles.includes(
        CustomerRoleEnum.Executive
      ),
      [CustomerRoleEnum.SalesRep]: supportedCompanyRoles.includes(
        CustomerRoleEnum.SalesRep
      ),
      [CustomerRoleEnum.Other]: supportedCompanyRoles.includes(
        CustomerRoleEnum.Other
      ),
    }
  );

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
                  Bespoke Company Role
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
              data-cy="edit-user-modal-first-name"
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
              data-cy="edit-user-modal-last-name"
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
              data-cy="edit-user-modal-email"
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
              dataCy="edit-user-modal-phone-number"
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
        <Box display="flex" flexDirection="column">
          {role === UserRolesEnum.BankAdmin && !isEditBankUser && (
            <Box display="flex" flexDirection="column" mt={4}>
              <Typography variant="body2" color="textSecondary">
                Supported Customer Roles
              </Typography>
              <List component="div">
                {Object.entries(CustomerRoleEnum).map(([key, value]) =>
                  value !== CustomerRoleEnum.None ? (
                    <ListItem key={value} value={value}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            disabled={role !== UserRolesEnum.BankAdmin} // ONLY bank ADMINs can edit role of a user.
                            checked={selectionState[value]}
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) => {
                              setSelectionState({
                                ...selectionState,
                                [value]: event.target.checked,
                              });
                            }}
                            color="primary"
                          />
                        }
                        label={CustomerRoleToLabel[value as CustomerRoleEnum]}
                      />
                    </ListItem>
                  ) : (
                    <></>
                  )
                )}
              </List>
              {selectionState[CustomerRoleEnum.Other] === true && (
                <Box ml={6}>
                  <TextField
                    multiline
                    label={"Other Role Information"}
                    value={otherRole}
                    onChange={({ target: { value } }) => setOtherRole(value)}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display={"flex"}>
          <SecondaryButton onClick={handleClose} text="Cancel" />
          <PrimaryButton
            dataCy="edit-user-modal-submit-button"
            isDisabled={updateButtonDisabled}
            onClick={handleSubmit}
            text="Update"
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserProfileModal;
