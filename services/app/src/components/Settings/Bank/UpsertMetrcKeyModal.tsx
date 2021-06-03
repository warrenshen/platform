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
import { upsertApiKeyMutation, viewApiKey } from "lib/api/metrc";
import { useEffect, useState } from "react";

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
  metrcApiKey: MetrcApiKeyFragment;
  handleClose: () => void;
}

function UpsertMetrcKeyModal({
  companySettingsId,
  metrcApiKey,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [errorMessage, setErrorMessage] = useState("");

  const [apiKey, setApiKey] = useState<string>("");
  const hasKey = !!metrcApiKey;

  const [upsertApiKey, { loading: isUpsertKeyLoading }] = useCustomMutation(
    upsertApiKeyMutation
  );

  useEffect(() => {
    async function viewKey() {
      const resp = await viewApiKey({
        variables: {
          metrc_api_key_id: metrcApiKey.id,
        },
      });
      if (resp.status === "OK") {
        setApiKey(resp.data?.api_key || "Invalid");
      }
    }

    if (metrcApiKey) {
      viewKey();
    }
  }, [metrcApiKey]);

  const handleRegisterClick = async () => {
    const response = await upsertApiKey({
      variables: {
        company_settings_id: companySettingsId,
        metrc_api_key_id: metrcApiKey ? metrcApiKey.id : null,
        api_key: apiKey.trim(),
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(`Could not save API key. Reason: ${response.msg}`);
    } else {
      snackbar.showSuccess("API key was saved successfully");
      handleClose();
    }
  };

  const isSubmitDisabled = !apiKey || isUpsertKeyLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>{hasKey ? "Edit Metrc Key" : "Add Metrc Key"}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Typography color="error" gutterBottom={true}>
            {errorMessage}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <TextField
            autoFocus
            label="API Key"
            required
            value={apiKey}
            onChange={({ target: { value } }) => {
              setApiKey(value);
            }}
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
            color="primary"
            onClick={handleRegisterClick}
          >
            {hasKey ? "Edit" : "Add"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default UpsertMetrcKeyModal;
