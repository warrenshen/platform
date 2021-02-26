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
  Typography,
} from "@material-ui/core";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractFragment,
  ContractsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { createProductConfigForServer } from "lib/customer/contracts";
import { createCompany } from "lib/customer/create";
import {
  AllProductTypes,
  ProductTypeToContractTermsJson,
  ProductTypeToLabel,
} from "lib/enum";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    input: {
      width: "100%",
    },
  })
);

interface Props {
  handleClose: () => void;
}

function AddCustomerModal({ handleClose }: Props) {
  const classes = useStyles();

  const [customer, setCustomer] = useState<CompaniesInsertInput>({});
  const [companySetting] = useState<CompanySettingsInsertInput>({});

  const [contract, setContract] = useState<ContractsInsertInput>({
    product_type: null,
    start_date: null,
  });
  const [currentJSONConfig, setCurrentJSONConfig] = useState<any>({});

  useEffect(() => {
    if (!contract.product_type) {
      return;
    }

    const getExistingConfig = (existingContract: ContractFragment | null) => {
      // Template contract fields based on the JSON template (values are all empty).
      const templateContractFields = JSON.parse(
        ProductTypeToContractTermsJson[contract.product_type as ProductTypeEnum]
      ).v1.fields;

      // Fill out the template contract fields based on the existing contract.
      if (
        existingContract?.product_config &&
        Object.keys(existingContract.product_config).length
      ) {
        const existingContractFields =
          existingContract.product_config.v1.fields;
        existingContractFields.forEach((existingContractField: any) => {
          const fieldName = existingContractField.internal_name;
          const templateContractField = templateContractFields.find(
            (templateContractField: any) =>
              templateContractField.internal_name === fieldName
          );
          if (
            templateContractField &&
            (existingContractField.value !== null ||
              templateContractField.nullable)
          ) {
            templateContractField.value = existingContractField.value;
          }
        });
      }

      return templateContractFields;
    };

    setCurrentJSONConfig(getExistingConfig(null));
  }, [contract.product_type]);

  const handleClickCreate = async () => {
    if (!contract || !contract.product_type) {
      console.log("Developer error");
      return;
    }

    const response = await createCompany({
      company: customer,
      settings: companySetting,
      contract: {
        product_type: contract.product_type,
        start_date: contract.start_date,
        end_date: contract.end_date,
        product_config: createProductConfigForServer(
          contract.product_type,
          currentJSONConfig
        ),
      },
    });

    if (response.status !== "OK") {
      alert("Error: could not create customer! Reason: " + response.msg);
    } else {
      handleClose();
    }
  };

  const isCreateDisabled =
    !customer.name ||
    !customer.identifier ||
    !contract.product_type ||
    !contract.start_date;

  return (
    <Dialog open onClose={handleClose} classes={{ paper: classes.dialog }}>
      <DialogTitle className={classes.dialogTitle}>Create Customer</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" mb={2}>
          <Typography variant="h6">Company Information</Typography>
          <Box>
            <TextField
              className={classes.input}
              label="Company Name"
              placeholder="Distributor Example, Inc."
              value={customer.name || ""}
              onChange={({ target: { value } }) => {
                setCustomer({ ...customer, name: value });
              }}
            />
          </Box>
          <Box mt={2}>
            <TextField
              className={classes.input}
              label="Company Identifier (Unique Short Name)"
              placeholder="DEI"
              value={customer.identifier || ""}
              onChange={({ target: { value } }) => {
                setCustomer({ ...customer, identifier: value });
              }}
            />
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h6">Contract Information</Typography>
          <Box mt={2}>
            <InputLabel id="select-product-type-label" required>
              Product Type
            </InputLabel>
            <Select
              className={classes.input}
              value={contract.product_type || ""}
              onChange={({ target: { value } }) => {
                setContract({
                  ...contract,
                  product_type: value as ProductTypeEnum,
                  product_config: {},
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
          {contract.product_type && (
            <Box display="flex" flexDirection="column" mt={2}>
              <ContractTermsForm
                isProductTypeVisible={false}
                isStartDateEditable
                contract={contract}
                currentJSONConfig={currentJSONConfig}
                setContract={setContract}
                setCurrentJSONConfig={setCurrentJSONConfig}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isCreateDisabled}
          variant="contained"
          color="primary"
          onClick={handleClickCreate}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCustomerModal;
