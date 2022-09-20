import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  CompanySettingsFragment,
  CompanySettingsLimitedFragment,
  ContractFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateCustomerSettingsMutation } from "lib/api/settings";
import { ProductTypeEnum } from "lib/enum";
import { SettingsHelper } from "lib/settings";
import { ChangeEvent, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      width: "100%",
      maxWidth: 300,
      minHeight: "200px",
    },
    dialog: {
      minWidth: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
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
  isBankUser: boolean;
  contract: ContractFragment | null;
  companyId: string;
  existingSettings: CompanySettingsFragment | CompanySettingsLimitedFragment;
  handleClose: () => void;
}

export default function EditCustomerSettingsModal({
  isBankUser,
  contract,
  companyId,
  existingSettings,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [settings, setSettings] = useState<
    CompanySettingsFragment | CompanySettingsLimitedFragment
  >(existingSettings);

  const [updateCustomerSettings, { loading: isUpdateCustomerSettingsLoading }] =
    useCustomMutation(updateCustomerSettingsMutation);

  const handleClickSave = async () => {
    const response = await updateCustomerSettings({
      variables: {
        company_settings_id: settings.id,
        is_autogenerate_repayments_enabled:
          settings.is_autogenerate_repayments_enabled,
        has_autofinancing: settings.has_autofinancing,
        vendor_agreement_docusign_template:
          settings.vendor_agreement_docusign_template,
        vendor_onboarding_link: settings.vendor_onboarding_link,
        payor_agreement_docusign_template:
          settings.payor_agreement_docusign_template,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError("Could not update settings.");
    } else {
      snackbar.showSuccess("Updated settings.");
      handleClose();
    }
  };

  if (contract === null) {
    return null;
  }

  const isSaveDisabled = isUpdateCustomerSettingsLoading;
  const settingsHelper = new SettingsHelper(
    contract.product_type as ProductTypeEnum
  );

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Edit Account Settings
      </DialogTitle>
      <DialogContent>
        <Box
          mt={1}
          mb={3}
          display="flex"
          flexDirection="column"
          className={classes.form}
        >
          {settingsHelper.shouldShowNoticeOfAssignment() && (
            <Box mb={2}>
              <TextField
                fullWidth
                disabled={!isBankUser}
                label="Notice of Assignment"
                placeholder="http://docusign.com/notice-of-assignment"
                value={settings.payor_agreement_docusign_template || ""}
                onChange={({ target: { value } }) => {
                  setSettings({
                    ...settings,
                    payor_agreement_docusign_template: value,
                  });
                }}
              />
            </Box>
          )}
          <Box mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={!isBankUser}
                  checked={settings.has_autofinancing || false}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setSettings({
                      ...settings,
                      has_autofinancing: event.target.checked,
                    });
                  }}
                  color="primary"
                />
              }
              label={"Is Autofinancing Enabled?"}
            />
          </Box>
          {settingsHelper.shouldShowAutogenerateRepayments() && (
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      settings.is_autogenerate_repayments_enabled || false
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setSettings({
                        ...settings,
                        is_autogenerate_repayments_enabled:
                          event.target.checked,
                      });
                    }}
                    color="primary"
                  />
                }
                label={"Is Autorepayment Enabled?"}
              />
              <Typography variant="body2" color="textSecondary">
                If selected, the platform will automatically generate repayments
                for your loans on their respective maturity date. Please note
                that Bespoke may override this in the event of failed payments.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isSaveDisabled}
          onClick={handleClickSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
