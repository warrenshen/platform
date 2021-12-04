import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { Companies, MetrcApiKeyFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { upsertApiKeyMutation, viewApiKey } from "lib/api/metrc";
import { ChangeEvent, useEffect, useState } from "react";

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
  companyId: Companies["id"];
  metrcApiKey: MetrcApiKeyFragment | null | undefined;
  handleClose: () => void;
}

export default function UpsertMetrcKeyModal({
  companyId,
  metrcApiKey,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [errorMessage, setErrorMessage] = useState("");

  const [apiKey, setApiKey] = useState<string>("");
  const [usState, setUsState] = useState<string>("");
  const [useSavedLicensesOnly, setUseSavedLicensesOnly] = useState<boolean>(
    false
  );
  const hasKey = !!metrcApiKey;

  const [upsertApiKey, { loading: isUpsertKeyLoading }] = useCustomMutation(
    upsertApiKeyMutation
  );

  useEffect(() => {
    async function viewKey() {
      if (!metrcApiKey) {
        return;
      }
      const resp = await viewApiKey({
        variables: {
          metrc_api_key_id: metrcApiKey.id,
        },
      });
      if (resp.status === "OK") {
        setApiKey(resp.data?.api_key || "Invalid");
        setUsState(resp.data?.us_state || "");
        setUseSavedLicensesOnly(resp.data?.use_saved_licenses_only || false);
      }
    }

    if (metrcApiKey) {
      viewKey();
    }
  }, [metrcApiKey]);

  const handleRegisterClick = async () => {
    const response = await upsertApiKey({
      variables: {
        company_id: companyId,
        metrc_api_key_id: metrcApiKey ? metrcApiKey.id : null,
        api_key: apiKey.trim(),
        us_state: usState?.trim(),
        use_saved_licenses_only: useSavedLicensesOnly,
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
          <TextField
            autoFocus
            label="API Key"
            required
            value={apiKey}
            onChange={({ target: { value } }) => setApiKey(value)}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            label="US State"
            required
            value={usState}
            onChange={({ target: { value } }) => setUsState(value)}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useSavedLicensesOnly}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setUseSavedLicensesOnly(event.target.checked)
                }
                color="primary"
              />
            }
            label={"Use Saved Licenses Only?"}
          />
          <Typography variant="body2" color="textSecondary">
            If checked, system will ONLY pull data for the licenses associated
            with this company - even if this Metrc API key grants permission to
            access additional licenses. This is intended to be used in the case
            two companies share the same Metrc API key.
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          {!!errorMessage && (
            <Typography color="error" gutterBottom={true}>
              {errorMessage}
            </Typography>
          )}
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
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
