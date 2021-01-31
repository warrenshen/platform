import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputLabel,
  makeStyles,
  TextField,
} from "@material-ui/core";
import ContractTermsLink from "components/Shared/Settings/ContractTermsLink";
import { ContractConfig } from "components/Shared/Settings/ContractTermsModal";
import {
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  GetCompanySettingsDocument,
  useUpdateCompanyAccountSettingsMutation,
} from "generated/graphql";
import { useState } from "react";

const useStyles = makeStyles({
  form: {
    width: "100%",
    maxWidth: 300,
    minHeight: "200px",
  },
});

interface Props {
  onClose: () => void;
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
}

function EditAccountSettings(props: Props) {
  const classes = useStyles();

  const [updateAccountSettings] = useUpdateCompanyAccountSettingsMutation();
  const [settings, setSettings] = useState<
    CompanySettingsFragment | CompanySettingsForCustomerFragment
  >(props.settings);

  const contractConfig = {
    product_type: settings.product_type,
    product_config: settings.product_config,
    isViewOnly: false,
  };

  return (
    <Dialog open onClose={props.onClose} maxWidth="md">
      <DialogTitle>Edit Account Settings</DialogTitle>
      <DialogContent>
        <Box
          mt={1}
          mb={3}
          display="flex"
          flexDirection="column"
          className={classes.form}
        >
          <Box mb={2}>
            <TextField
              label="Product Type"
              disabled={true}
              required
              value={settings.product_type}
            ></TextField>
          </Box>
          <Box mb={2}>
            <TextField
              label="Vendor Agreement"
              placeholder="http://docusign.com/link/to/template"
              value={settings.vendor_agreement_docusign_template || ""}
              onChange={({ target: { value } }) => {
                setSettings({
                  ...settings,
                  vendor_agreement_docusign_template: value,
                });
              }}
            ></TextField>
          </Box>
          <Box mb={2}>
            <InputLabel>Contract Terms</InputLabel>
            <ContractTermsLink
              linkText="Edit"
              contractConfig={contractConfig}
              onSave={(newContractConfig: ContractConfig) => {
                setSettings({
                  ...settings,
                  product_config: newContractConfig.product_config,
                });
              }}
            ></ContractTermsLink>
          </Box>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={async () => {
              await updateAccountSettings({
                variables: {
                  companySettingsId: settings.id,
                  vendorAgreementTemplateLink:
                    settings.vendor_agreement_docusign_template,
                  productConfig: settings.product_config,
                },
                refetchQueries: [
                  {
                    query: GetCompanySettingsDocument,
                    variables: {
                      companySettingsId: settings.id,
                    },
                  },
                ],
              });
              props.onClose();
            }}
          >
            Update
          </Button>
          <Button size="small" onClick={props.onClose}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditAccountSettings;
