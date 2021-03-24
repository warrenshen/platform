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
import { UsersInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createPayorVendorUserMutation } from "lib/api/users";
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
  isPayor: boolean;
  companyId: string;
  handleClose: () => void;
}

function InviteThirdPartyUserModal({ isPayor, companyId, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [user, setUser] = useState<UsersInsertInput>({
    company_id: companyId,
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [errMsg, setErrMsg] = useState("");

  const [
    createPayorVendorUser,
    { loading: isCreatePayorVendorUserLoading },
  ] = useCustomMutation(createPayorVendorUserMutation);

  const handleClickSubmit = async () => {
    const response = await createPayorVendorUser({
      variables: {
        is_payor: isPayor,
        company_id: companyId,
        user: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
        } as UsersInsertInput,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
      snackbar.showError(
        `Error! Could not create user. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Success! User created and sent a welcome email.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !user.first_name ||
    !user.last_name ||
    !user.email ||
    isCreatePayorVendorUserLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Invite New Contact
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
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

export default InviteThirdPartyUserModal;
