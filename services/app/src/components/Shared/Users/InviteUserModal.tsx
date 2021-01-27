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
import {
  ListUsersByCompanyIdDocument,
  ListUsersByCompanyIdQuery,
  ListUsersByCompanyIdQueryVariables,
  ListUsersByRoleDocument,
  ListUsersByRoleQuery,
  ListUsersByRoleQueryVariables,
  useAddUserMutation,
  UserFragment,
  UserRolesEnum,
  UsersInsertInput,
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
  companyId?: string;
  handleClose: () => void;
}

function InviteUserModal({ companyId, handleClose }: Props) {
  const classes = useStyles();

  const [user, setUser] = useState<UsersInsertInput>({
    company_id: companyId,
    phone_number: "",
    role: null,
    email: "",
    first_name: "",
    full_name: "",
    last_name: "",
    password: "",
  });

  const [addUser] = useAddUserMutation();

  return (
    <Dialog open onClose={handleClose} maxWidth="xl">
      <DialogTitle className={classes.dialogTitle}>Invite User</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <FormControl className={classes.usersInput}>
            <InputLabel id="user-role-select-label">User Role</InputLabel>
            <Select
              disabled={false}
              labelId="user-role-select-label"
              value={user.role || ""}
              onChange={({ target: { value } }) => {
                setUser({ ...user, role: value as UserRolesEnum });
              }}
            >
              {!companyId && (
                <MenuItem value={UserRolesEnum.BankAdmin}>
                  {UserRolesEnum.BankAdmin}
                </MenuItem>
              )}
              {companyId && (
                <MenuItem value={UserRolesEnum.CompanyAdmin}>
                  {UserRolesEnum.CompanyAdmin}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            label="First Name"
            className={classes.usersInput}
            value={user?.first_name}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                first_name: value,
              });
            }}
          ></TextField>
          <TextField
            label="Last Name"
            className={classes.usersInput}
            value={user?.last_name}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                last_name: value,
              });
            }}
          ></TextField>
          <TextField
            label="Email"
            className={classes.usersInput}
            value={user?.email}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                email: value,
              });
            }}
          ></TextField>
          <TextField
            label="Phone Number"
            className={classes.usersInput}
            value={user?.phone_number}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                phone_number: value,
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
            disabled={false}
            onClick={async () => {
              await addUser({
                variables: {
                  user: {
                    company_id: companyId,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    role: user.role,
                  },
                },
                optimisticResponse: {
                  insert_users_one: {
                    email: user.email ? user.email : "",
                    first_name: user.first_name ? user.first_name : "",
                    last_name: user.last_name ? user.last_name : "",
                    phone_number: user.phone_number,
                    role: user.role,
                  } as UserFragment,
                },
                update: (proxy, { data: optimisticResponse }) => {
                  const dataUsersByRole = proxy.readQuery<
                    ListUsersByRoleQuery,
                    ListUsersByRoleQueryVariables
                  >({
                    query: ListUsersByRoleDocument,
                    variables: { role: user?.role ? user?.role : null },
                  });

                  if (
                    !dataUsersByRole ||
                    !dataUsersByRole?.users ||
                    !optimisticResponse?.insert_users_one
                  ) {
                    return;
                  }

                  proxy.writeQuery<
                    ListUsersByRoleQuery,
                    ListUsersByRoleQueryVariables
                  >({
                    query: ListUsersByRoleDocument,
                    variables: { role: user?.role ? user?.role : null },
                    data: {
                      users: [
                        ...dataUsersByRole?.users,
                        optimisticResponse?.insert_users_one,
                      ],
                    },
                  });

                  const dataUsersByCompanyId = proxy.readQuery<
                    ListUsersByCompanyIdQuery,
                    ListUsersByCompanyIdQueryVariables
                  >({
                    query: ListUsersByCompanyIdDocument,
                    variables: { companyId: companyId },
                  });

                  if (
                    !dataUsersByCompanyId ||
                    !dataUsersByCompanyId?.users ||
                    !optimisticResponse?.insert_users_one
                  ) {
                    return;
                  }

                  proxy.writeQuery<
                    ListUsersByCompanyIdQuery,
                    ListUsersByCompanyIdQueryVariables
                  >({
                    query: ListUsersByCompanyIdDocument,
                    variables: { companyId: companyId },
                    data: {
                      users: [
                        ...dataUsersByCompanyId?.users,
                        optimisticResponse?.insert_users_one,
                      ],
                    },
                  });
                },
              });
              handleClose();
            }}
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
