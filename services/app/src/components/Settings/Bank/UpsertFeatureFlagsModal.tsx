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
import AutocompleteReportingRequirements from "components/Settings/Bank/AutocompleteReportingRequirements";
import { CompanySettings } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { upsertFeatureFlagsMutation } from "lib/api/settings";
import { getFeatureFlagDescription, getFeatureFlagName } from "lib/companies";
import { FeatureFlagEnum } from "lib/enum";
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
  featureFlagsPayload: { [key in FeatureFlagEnum]: boolean | string | null };
  handleClose: () => void;
}

export default function UpsertFeatureFlagsModal({
  companySettingsId,
  featureFlagsPayload,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [featureFlagsJson, setFeatureFlagsJson] =
    useState<Record<string, string | boolean | null>>(featureFlagsPayload);
  const [errorMessage, setErrorMessage] = useState("");

  const [upsertFeatureFlags, { loading: isUpsertFeatureFlagsLoading }] =
    useCustomMutation(upsertFeatureFlagsMutation);

  const handleClickSubmit = async () => {
    const response = await upsertFeatureFlags({
      variables: {
        company_settings_id: companySettingsId,
        feature_flags_payload: featureFlagsJson,
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Could not update enabled feature. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Enabled features updated successfully");
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
          {!!errorMessage && (
            <Typography color="error" gutterBottom={true}>
              {errorMessage}
            </Typography>
          )}
        </Box>
        <Box display="flex" flexDirection="column">
          <Box
            key={FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers}
            mt={4}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    !!featureFlagsJson[
                      FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers
                    ]
                  }
                  color="primary"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setFeatureFlagsJson({
                      ...featureFlagsJson,
                      [FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers]:
                        event.target.checked,
                    })
                  }
                />
              }
              label={getFeatureFlagName(
                FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers
              )}
            />
            <Box pl={2}>
              <Typography variant="subtitle2" color="textSecondary">
                {getFeatureFlagDescription(
                  FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers
                )}
              </Typography>
            </Box>
          </Box>
          <AutocompleteReportingRequirements
            featureFlagsJson={featureFlagsJson || {}}
            setFeatureFlagsJson={setFeatureFlagsJson}
          />
          <Box key={FeatureFlagEnum.OverrideRepaymentAutogeneration} mt={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    !!featureFlagsJson[
                      FeatureFlagEnum.OverrideRepaymentAutogeneration
                    ]
                  }
                  color="primary"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setFeatureFlagsJson({
                      ...featureFlagsJson,
                      [FeatureFlagEnum.OverrideRepaymentAutogeneration]:
                        event.target.checked,
                    })
                  }
                />
              }
              label={getFeatureFlagName(
                FeatureFlagEnum.OverrideRepaymentAutogeneration
              )}
            />
            <Box pl={2}>
              <Typography variant="subtitle2" color="textSecondary">
                {getFeatureFlagDescription(
                  FeatureFlagEnum.OverrideRepaymentAutogeneration
                )}
              </Typography>
            </Box>
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
