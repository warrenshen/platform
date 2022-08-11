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
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import {
  Companies,
  UserFragment,
  Users,
  useGetUserQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createEditVendorContactsRequestMutation } from "lib/api/companies";
import { isEmailValid } from "lib/validation";
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
  userProfileId: Users["id"];
  handleClose: () => void;
  vendorId: Companies["id"];
  requestingCompanyId: Companies["id"];
}

function EditUserProfileMiniModal({
  userProfileId,
  handleClose,
  vendorId,
  requestingCompanyId,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const newProfile: UserFragment = {
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    full_name: "",
    created_at: "",
    role: null,
  };

  const [userProfile, setUserProfile] = useState(newProfile);

  useGetUserQuery({
    fetchPolicy: "network-only",
    variables: {
      id: userProfileId,
    },
    onCompleted: (data) => {
      const existingProfile = data?.users_by_pk;
      if (existingProfile) {
        setUserProfile(
          mergeWith(newProfile, existingProfile, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  const [updateUserDetails, { loading: isUpdateUserLoading }] =
    useCustomMutation(createEditVendorContactsRequestMutation);

  const handleSubmit = async () => {
    const response = await updateUserDetails({
      variables: {
        first_name: userProfile?.first_name || "",
        last_name: userProfile?.last_name || "",
        phone_number: userProfile?.phone_number || "",
        email: userProfile?.email || "",
        vendor_user_id: userProfileId,
        requested_vendor_id: vendorId,
        requesting_company_id: requestingCompanyId,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Vendor contact information change requested.");
      handleClose();
    }
  };

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
            <TextField
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
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={updateButtonDisabled}
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserProfileMiniModal;
