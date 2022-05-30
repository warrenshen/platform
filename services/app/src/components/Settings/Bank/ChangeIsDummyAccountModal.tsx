import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  CompanySettings,
  useUpdateIsDummyAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { ChangeEvent, useState } from "react";

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
  companySettingsId: CompanySettings["id"];
  isDummyAccountInitially: boolean;
  handleClose: () => void;
}

export default function ChangeIsDummyAccountModal({
  companySettingsId,
  isDummyAccountInitially,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [isDummyAccount, setIsDummyAccount] = useState(isDummyAccountInitially);

  const [errorMessage, setErrorMessage] = useState("");

  const [updateIsDummyAccount, { loading: isUpdateDummyAccountLoading }] =
    useUpdateIsDummyAccountMutation();

  const handleClickSubmit = async () => {
    const response = await updateIsDummyAccount({
      variables: {
        companySettingsId: companySettingsId,
        isDummyAccount: isDummyAccount,
      },
    });
    if (!response?.data?.update_company_settings_by_pk) {
      setErrorMessage(`Could not save is dummy account`);
      snackbar.showError(`Could not save is dummy account`);
    } else {
      snackbar.showSuccess("Is dummy account updated successfully");
      handleClose();
    }
  };

  const isSubmitDisabled = isUpdateDummyAccountLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Set Is Dummy Account</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          {!!errorMessage && (
            <Typography color="error" gutterBottom={true}>
              {errorMessage}
            </Typography>
          )}
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="body2" color="textSecondary">
            Enabling "is dummy account" excludes this customer from all
            financial calculations.
          </Typography>
          <Box mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDummyAccount}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setIsDummyAccount(event.target.checked)
                  }
                  color="primary"
                />
              }
              label={"Is Dummy Account?"}
            />
          </Box>
        </Box>
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
            onClick={handleClickSubmit}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
