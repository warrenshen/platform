import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Users } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deactivateCustomerUserMutation } from "lib/api/users";
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
  companyId: string | null;
  user: Users;
  handleClose: () => void;
}

function DeactivateUserModal({ companyId, user, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const [errMsg, setErrMsg] = useState("");

  const [deactivateCustomerUser, { loading: isDeactivateCustomerUserLoading }] =
    useCustomMutation(deactivateCustomerUserMutation);

  const handleClickSubmit = async () => {
    const response = await deactivateCustomerUser({
      variables: {
        user_id: user.id,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
      snackbar.showError(`Could not deactivate user. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("User deactivated.");
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Deactivate User</DialogTitle>
      <DialogContent>
        <div>
          Deactivating this user will make it so this user can no longer access
          the platform. This can be undone in the Deactivate Users section.
        </div>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField disabled label="First Name" value={user.first_name} />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField disabled label="Last Name" value={user.last_name} />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField disabled label="Email" value={user.email} />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              disabled
              label="Phone Number"
              value={user.phone_number || null}
            />
          </Box>
          {errMsg && <div>Error: {errMsg}</div>}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={isDeactivateCustomerUserLoading}
            className={classes.submitButton}
            onClick={handleClickSubmit}
            variant="contained"
            color="secondary"
          >
            Deactivate
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default DeactivateUserModal;
