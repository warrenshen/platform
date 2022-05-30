import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AddVendorForm from "components/Vendors/AddVendorForm";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { Companies } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { addNewVendorMutation } from "lib/api/companies";
import { isEmailValid } from "lib/validation";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  customerId: Companies["id"];
  handleClose: () => void;
}

export type AddVendorInput = {
  email: string;
};

export default function AddVendorNewModal({ customerId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [errorMessage, setErrorMessage] = useState("");

  const [vendorInput, setVendorInput] = useState<AddVendorInput>({
    email: "",
  });

  const [addNewVendor, { loading: isAddVendorLoading }] =
    useCustomMutation(addNewVendorMutation);

  const handleRegisterClick = async () => {
    const response = await addNewVendor({
      variables: {
        email: vendorInput.email,
        customer_id: customerId,
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Could not create vendor request. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Vendor request has been sent to the user email");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !vendorInput.email ||
    !isEmailValid(vendorInput.email) ||
    isAddVendorLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Add Vendor</DialogTitle>
      {isBankUser && (
        <Box mt={2} mb={4} mx={3}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are inviting a vendor on behalf of this customer
                (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}

      <DialogContent>
        <AddVendorForm
          vendorInput={vendorInput}
          setVendorInput={setVendorInput}
        />
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Box display="flex">
          <Box mr={2}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={isSubmitDisabled}
            variant="contained"
            color="primary"
            onClick={handleRegisterClick}
          >
            Submit
          </Button>
          {errorMessage && (
            <Typography variant="body2" color="secondary">
              {errorMessage}
            </Typography>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
