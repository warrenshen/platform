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
} from "@material-ui/core";
import {
  CompanySettingsFragment,
  CompanySettingsLimitedFragment,
  ContractFragment,
  useUpdateCustomerSettingsMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
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
  contract: ContractFragment | null;
  companyId: string;
  existingSettings: CompanySettingsFragment | CompanySettingsLimitedFragment;
  handleClose: () => void;
}

export default function EditCustomerSettingsModal({
  contract,
  companyId,
  existingSettings,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [updateCustomerSettings] = useUpdateCustomerSettingsMutation();
  const [settings, setSettings] = useState<
    CompanySettingsFragment | CompanySettingsLimitedFragment
  >(existingSettings);

  const handleClickSave = async () => {
    const response = await updateCustomerSettings({
      variables: {
        companySettingsId: settings.id,
        vendorAgreementTemplateLink:
          settings.vendor_agreement_docusign_template,
        vendorOnboardingLink: settings.vendor_onboarding_link,
        payorAgreementTemplateLink: settings.payor_agreement_docusign_template,
        hasAutofinancing: settings.has_autofinancing,
      },
    });

    const savedCompanySettings = response.data?.update_company_settings_by_pk;
    if (!savedCompanySettings) {
      snackbar.showError("Could not update settings.");
    } else {
      snackbar.showSuccess("Updated settings.");
      handleClose();
    }
  };

  if (contract === null) {
    return null;
  }

  const isSaveDisabled = false;
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
          {settingsHelper.shouldShowVendorOnboardingLink() && (
            <Box mb={2}>
              <TextField
                fullWidth
                label="Vendor Onboarding Link"
                placeholder="http://forms.google.com/vendor-onboarding"
                value={settings.vendor_onboarding_link || ""}
                onChange={({ target: { value } }) => {
                  setSettings({
                    ...settings,
                    vendor_onboarding_link: value,
                  });
                }}
              />
            </Box>
          )}
          {settingsHelper.shouldShowVendorAgreement() && (
            <Box mb={2}>
              <TextField
                fullWidth
                label="Vendor Onboarding Link"
                placeholder="http://docusign.com/vendor-agreement"
                value={settings.vendor_agreement_docusign_template || ""}
                onChange={({ target: { value } }) => {
                  setSettings({
                    ...settings,
                    vendor_agreement_docusign_template: value,
                  });
                }}
              />
            </Box>
          )}
          {settingsHelper.shouldShowNoticeOfAssignment() && (
            <Box mb={2}>
              <TextField
                fullWidth
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
