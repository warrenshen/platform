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
import { authenticatedApi, userRoutes } from "lib/api";
import { UserRoleToLabel } from "lib/enum";
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

export async function createLogin(req: {
  company_id: string | null;
  user_id: string;
}): Promise<{ status: string; msg?: string }> {
  return authenticatedApi
    .post(userRoutes.createLogin, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return { status: "ERROR", msg: "Could not create login for user" };
      }
    );
}

interface Props {
  companyId?: string;
  userRoles: UserRolesEnum[];
  handleClose: () => void;
}

function InviteUserModal({ companyId, userRoles, handleClose }: Props) {
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
  const [errMsg, setErrMsg] = useState("");

  const [addUser] = useAddUserMutation();

  const handleClickSubmit = async () => {
    const resp = await addUser({
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
          variables: { role: user.role || null },
        });

        if (
          !dataUsersByRole ||
          !dataUsersByRole?.users ||
          !optimisticResponse?.insert_users_one
        ) {
          return;
        }

        proxy.writeQuery<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>({
          query: ListUsersByRoleDocument,
          variables: { role: user.role || null },
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

    const userId = resp.data?.insert_users_one?.id;
    if (!userId) {
      setErrMsg("No user id was created");
      return;
    }

    const loginResp = await createLogin({
      company_id: companyId || null,
      user_id: userId,
    });
    if (loginResp.status !== "OK") {
      setErrMsg(loginResp.msg || "Error creating login for user");
      return;
    }
    handleClose();
  };

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
          <FormControl className={classes.usersInput}>
            <InputLabel id="user-role-select-label">User Role</InputLabel>
            <Select
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
          <TextField
            label="First Name"
            className={classes.usersInput}
            value={user.first_name}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                first_name: value,
              });
            }}
          />
          <TextField
            label="Last Name"
            className={classes.usersInput}
            value={user.last_name}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                last_name: value,
              });
            }}
          />
          <TextField
            label="Email"
            className={classes.usersInput}
            value={user.email}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                email: value,
              });
            }}
          />
          <TextField
            label="Phone Number"
            className={classes.usersInput}
            value={user.phone_number}
            onChange={({ target: { value } }) => {
              setUser({
                ...user,
                phone_number: value,
              });
            }}
          />
          {errMsg && <div>Error: {errMsg}</div>}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={false}
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
