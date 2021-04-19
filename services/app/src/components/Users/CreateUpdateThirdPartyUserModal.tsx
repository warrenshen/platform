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
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import { useGetUserQuery, UsersInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createPayorVendorUserMutation,
  updatePayorVendorUserMutation,
} from "lib/api/users";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
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
  isPayor: boolean;
  actionType: ActionType;
  companyId: string;
  userId: string | null;
  handleClose: () => void;
}

function CreateUpdateThirdPartyUserModal({
  isPayor,
  actionType,
  companyId,
  userId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const newUser = {
    company_id: companyId,
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  } as UsersInsertInput;

  const [user, setUser] = useState(newUser);

  const { loading: isExistingUserLoading } = useGetUserQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: userId,
    },
    onCompleted: (data) => {
      const existingUser = data?.users_by_pk;
      if (actionType === ActionType.Update && existingUser) {
        setUser(
          mergeWith(newUser, existingUser, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  const [errMsg, setErrMsg] = useState("");

  const [
    createPayorVendorUser,
    { loading: isCreatePayorVendorUserLoading },
  ] = useCustomMutation(createPayorVendorUserMutation);

  const [
    updatePayorVendorUser,
    { loading: isUpdatePayorVendorUserLoading },
  ] = useCustomMutation(updatePayorVendorUserMutation);

  const handleClickSubmit = async () => {
    if (actionType === ActionType.Update) {
      const response = await updatePayorVendorUser({
        variables: {
          company_id: companyId,
          user_id: userId,
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
        snackbar.showError(`Could not update user. Reason: ${response.msg}`);
      } else {
        snackbar.showSuccess("User updated.");
        handleClose();
      }
    } else {
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
        snackbar.showError(`Could not create user. Error: ${response.msg}`);
      } else {
        snackbar.showSuccess("User created and sent a welcome email.");
        handleClose();
      }
    }
  };

  const isSubmitDisabled =
    !user.first_name ||
    !user.last_name ||
    !user.email ||
    !user.phone_number ||
    isExistingUserLoading ||
    isCreatePayorVendorUserLoading ||
    isUpdatePayorVendorUserLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {actionType === ActionType.Update
          ? "Update Contact"
          : "Invite New Contact"}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
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

export default CreateUpdateThirdPartyUserModal;
