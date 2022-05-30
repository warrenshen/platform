import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  CompanySettings,
  CompanySettingsInsertInput,
  UsersInsertInput,
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import {
  AllTwoFactorMessageMethods,
  TwoFactorMessageMethodToLabel,
} from "lib/enum";
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
  companySettingsId: CompanySettings["id"];
  handleClose: () => void;
}

export default function UpdateThirdPartyCompanySettingsModal({
  companySettingsId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const newCompanySettings = {
    company_id: companySettingsId,
    two_factor_message_method: null,
  } as CompanySettingsInsertInput;

  const [companySettings, setCompanySettings] = useState(newCompanySettings);

  const { loading: isExistingCompanySettingsLoading } =
    useGetCompanySettingsQuery({
      fetchPolicy: "network-only",
      variables: {
        company_settings_id: companySettingsId,
      },
      onCompleted: (data) => {
        const existingCompanySettings = data?.company_settings_by_pk;
        if (existingCompanySettings) {
          setCompanySettings(
            mergeWith(newCompanySettings, existingCompanySettings, (a, b) =>
              isNull(b) ? a : b
            )
          );
        }
      },
    });

  const [updateCompanySettings, { loading: isUpdateCompanySettingsLoading }] =
    useUpdateCompanySettingsMutation();

  const handleClickSubmit = async () => {
    const response = await updateCompanySettings({
      variables: {
        company_settings_id: companySettingsId,
        company_settings: {
          two_factor_message_method: companySettings.two_factor_message_method,
        } as UsersInsertInput,
      },
    });

    const savedCompanySettings = response.data?.update_company_settings_by_pk;
    if (!savedCompanySettings) {
      snackbar.showError(`Could not update settings.`);
    } else {
      snackbar.showSuccess("Updated settings.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !companySettings.two_factor_message_method ||
    isExistingCompanySettingsLoading ||
    isUpdateCompanySettingsLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Edit Settings</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" mt={4}>
            <FormControl>
              <InputLabel id="two-factor-message-method-select-label">
                2FA Method
              </InputLabel>
              <Select
                required
                labelId="two-factor-message-method-select-label"
                id="two-factor-message-method-select"
                value={companySettings.two_factor_message_method || ""}
                onChange={({ target: { value } }) =>
                  setCompanySettings({
                    ...companySettings,
                    two_factor_message_method: value as string,
                  })
                }
              >
                <MenuItem value={""}>
                  <em>None</em>
                </MenuItem>
                {AllTwoFactorMessageMethods.map((twoFactorMethod) => (
                  <MenuItem key={twoFactorMethod} value={twoFactorMethod}>
                    {TwoFactorMessageMethodToLabel[twoFactorMethod]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
