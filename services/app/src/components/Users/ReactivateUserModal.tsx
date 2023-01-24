import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryWarningButton from "components/Shared/Button/PrimaryWarningButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import { Users } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { reactivateCustomerUserMutation } from "lib/api/users";
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

function ReactivateUserModal({ companyId, user, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const [errMsg, setErrMsg] = useState("");

  const [reactivateCustomerUser, { loading: isReactivateCustomerUserLoading }] =
    useCustomMutation(reactivateCustomerUserMutation);

  const handleClickSubmit = async () => {
    const response = await reactivateCustomerUser({
      variables: {
        user_id: user.id,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
      snackbar.showError(`Could not re-activate user. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("User re-activated.");
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
      <DialogTitle className={classes.dialogTitle}>Reactivate User</DialogTitle>
      <DialogContent>
        <div>
          Reactivating this user will make it so this user can access the
          platform. Their previous password should be used to access the
          platform.
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
        <Box display={"flex"}>
          <SecondaryButton onClick={handleClose} text="Cancel" />
          <PrimaryWarningButton
            dataCy="reactivate-user-modal-submit-button"
            isDisabled={isReactivateCustomerUserLoading}
            onClick={handleClickSubmit}
            text="Reactivate"
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ReactivateUserModal;
