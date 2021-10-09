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
  Typography,
} from "@material-ui/core";
import { CompanySettings, MetrcApiKeyFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteApiKeyMutation } from "lib/api/metrc";
import { useState } from "react";

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
  metrcApiKey: MetrcApiKeyFragment | null | undefined;
  handleClose: () => void;
}

export default function DeleteMetrcKeyModal({
  companySettingsId,
  metrcApiKey,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [errorMessage, setErrorMessage] = useState("");
  const [deleteApiKey, { loading: isUpsertKeyLoading }] = useCustomMutation(
    deleteApiKeyMutation
  );

  const handleRegisterClick = async () => {
    const response = await deleteApiKey({
      variables: {
        company_settings_id: companySettingsId,
        metrc_api_key_id: metrcApiKey ? metrcApiKey.id : null,
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(`Could not delete API key. Reason: ${response.msg}`);
    } else {
      snackbar.showSuccess("API key was deleted successfully");
      handleClose();
    }
  };

  const isSubmitDisabled = isUpsertKeyLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>{"Delete Metrc Key"}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          {!!errorMessage && (
            <Typography color="error" gutterBottom={true}>
              {errorMessage}
            </Typography>
          )}
        </Box>
        <Box display="flex" flexDirection="column" mb={2}>
          <TextField
            autoFocus
            label="Platform ID"
            required
            value={metrcApiKey?.id || ""}
          />
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            autoFocus
            label="US State"
            required
            value={metrcApiKey?.us_state || ""}
          />
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
            color="default"
            onClick={handleRegisterClick}
          >
            Delete
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}