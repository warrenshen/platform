import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
  ContractsInsertInput,
  ProductTypeEnum,
  useAddContractMutation,
  useUpdateCompanySettingsMutation,
  useUpdateContractMutation,
} from "generated/graphql";
import { AllProductTypes, ProductTypeToLabel } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

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
  companyId: string;
  existingSettings:
    | CompanySettingsFragment
    | CompanySettingsForCustomerFragment;
  existingContract: ContractFragment | null;
  handleClose: () => void;
}

function EditAccountSettingsModal({
  companyId,
  existingSettings,
  existingContract,
  handleClose,
}: Props) {
  const classes = useStyles();

  const [updateCompanySettings] = useUpdateCompanySettingsMutation();
  const [addContract] = useAddContractMutation();
  const [updateContract] = useUpdateContractMutation();

  const [settings, setSettings] = useState<
    CompanySettingsFragment | CompanySettingsForCustomerFragment
  >(existingSettings);

  const newContract = {
    company_id: companyId,
    start_date: new Date(),
    product_type: ProductTypeEnum.None,
    product_config: {},
  } as ContractsInsertInput;

  const [contract, setContract] = useState(
    mergeWith(newContract, existingContract, (a, b) => (isNull(b) ? a : b))
  );

  const handleClickSave = async () => {
    let contractId = contract.id;

    if (!existingContract) {
      window.console.log("No contract is setup yet, so creating one");

      const addContractResp = await addContract({
        variables: {
          contract: {
            start_date: contract.start_date,
            product_type: contract.product_type,
            product_config: contract.product_config,
          },
        },
      });
      contractId = addContractResp.data?.insert_contracts_one?.id;
    } else {
      await updateContract({
        variables: {
          contractId,
          contract: {
            product_type: contract.product_type,
            product_config: contract.product_config,
          },
        },
      });
    }

    await updateCompanySettings({
      variables: {
        companyId,
        contractId,
        companySettingsId: settings.id,
        vendorAgreementTemplateLink:
          settings.vendor_agreement_docusign_template,
      },
    });

    handleClose();
  };

  const isSaveDisabled = !contract.product_type;

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
          <Box mb={2}>
            <InputLabel id="select-label-product-type">Product Type</InputLabel>
            <Select
              id="select-product-type"
              labelId="select-label-product-type"
              value={contract?.product_type || ""}
              onChange={({ target: { value } }) => {
                setContract({
                  ...contract,
                  product_type: value as ProductTypeEnum,
                  product_config:
                    value === contract.product_type
                      ? contract.product_config
                      : {},
                });
              }}
              style={{ width: 200 }}
            >
              {AllProductTypes.map((productType) => (
                <MenuItem key={productType} value={productType}>
                  {ProductTypeToLabel[productType as ProductTypeEnum]}
                </MenuItem>
              ))}
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

export default EditAccountSettingsModal;
