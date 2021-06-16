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
  Theme,
  Typography,
} from "@material-ui/core";
import { CompanySettings } from "generated/graphql";
import { FeatureFlagEnum, AllFeatureFlags } from "lib/enum";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { upsertFeatureFlagsMutation } from "lib/api/companies";
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
  featureFlagsPayload: { [key in FeatureFlagEnum]: boolean | null };
  handleClose: () => void;
}

export default function UpsertFeatureFlagsModal({
  companySettingsId,
  featureFlagsPayload,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [featureFlagsJson, setFeatureFlagsJson] = useState(featureFlagsPayload);

  const [errorMessage, setErrorMessage] = useState("");

  const [
    upsertFeatureFlags,
    { loading: isUpsertFeatureFlagsLoading },
  ] = useCustomMutation(upsertFeatureFlagsMutation);

  const handleClickSubmit = async () => {
    const response = await upsertFeatureFlags({
      variables: {
        company_settings_id: companySettingsId,
        feature_flags_payload: featureFlagsJson,
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

  const isSubmitDisabled = !featureFlagsJson || isUpsertFeatureFlagsLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Edit Supported Features</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Typography color="error" gutterBottom={true}>
            {errorMessage}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Box mt={2}>
            {AllFeatureFlags.map((featureFlag) => (
              <Box key={featureFlag}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!featureFlagsJson[featureFlag]}
                      color="primary"
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setFeatureFlagsJson({
                          ...featureFlagsJson,
                          [featureFlag]: event.target.checked,
                        })
                      }
                    />
                  }
                  label={featureFlag}
                />
              </Box>
            ))}
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
