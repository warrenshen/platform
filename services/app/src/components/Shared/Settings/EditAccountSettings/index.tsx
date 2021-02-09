import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import ContractTermsLink from "components/Shared/Settings/ContractTermsLink";
import { ContractConfig } from "components/Shared/Settings/ContractTermsModal";
import {
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
  GetCompanySettingsDocument,
  GetContractDocument,
  ProductTypeEnum,
  useAddContractMutation,
  useUpdateCompanyAccountSettingsMutation,
  useUpdateContractMutation,
} from "generated/graphql";
import { ProductTypeKeys, ProductTypeToLabel } from "lib/enum";
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
  companyId: string;
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  contract: ContractFragment;
}

function EditAccountSettings(props: Props) {
  const classes = useStyles();

  const [updateAccountSettings] = useUpdateCompanyAccountSettingsMutation();
  const [updateContract] = useUpdateContractMutation();
  const [addContract] = useAddContractMutation();

  const [settings, setSettings] = useState<
    CompanySettingsFragment | CompanySettingsForCustomerFragment
  >(props.settings);
  const [contract, setContract] = useState<ContractFragment>(props.contract);

  const contractConfig = {
    product_type: contract?.product_type,
    product_config: contract?.product_config || {},
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
            <InputLabel>Product Type</InputLabel>
            <Select
              value={contract?.product_type || ""}
              onChange={({ target: { value } }) => {
                let newProductConfig = contract?.product_config;
                if (value !== contract?.product_type) {
                  // NOTE: If the product type changes, the product_config gets wiped out
                  newProductConfig = {};
                }

                setContract({
                  ...contract,
                  product_type: value as ProductTypeEnum,
                  product_config: newProductConfig,
                });
              }}
              style={{ width: 200 }}
            >
              {ProductTypeKeys.map((productType) => {
                return (
                  <MenuItem key={productType} value={productType}>
                    {ProductTypeToLabel[productType as ProductTypeEnum]}
                  </MenuItem>
                );
              })}
            </Select>
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
                setContract({
                  ...contract,
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
              let contractId = contract?.id;
              if (!contractId) {
                window.console.log("No contract is setup yet, so creating one");
                contract.start_date = new Date();
                const addContractResp = await addContract({
                  variables: {
                    contract: {
                      ...contract,
                      company_id: props.companyId,
                    },
                  },
                });
                contractId = addContractResp.data?.insert_contracts_one?.id;
              } else {
                await updateContract({
                  variables: {
                    contractId: contractId,
                    contract: {
                      ...contract,
                      company_id: props.companyId,
                    },
                  },
                });
              }

              await updateAccountSettings({
                variables: {
                  companyId: props.companyId,
                  contractId: contractId,
                  companySettingsId: settings.id,
                  vendorAgreementTemplateLink:
                    settings.vendor_agreement_docusign_template,
                },
                refetchQueries: [
                  {
                    query: GetCompanySettingsDocument,
                    variables: {
                      companySettingsId: settings.id,
                    },
                  },
                  {
                    query: GetContractDocument,
                    variables: {
                      contractId: contractId,
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
