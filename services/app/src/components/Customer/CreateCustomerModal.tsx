import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractsInsertInput,
} from "generated/graphql";
import {
  createProductConfigFieldsFromProductType,
  createProductConfigForServer,
} from "lib/customer/contracts";
import { createCompany } from "lib/customer/create";
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
    if (contract.product_type) {
      setCurrentJSONConfig(
        createProductConfigFieldsFromProductType(contract.product_type)
      );
    }
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

  const [
    isLateFeeDynamicFormValid,
    setIsLateFeeDynamicFormValid,
  ] = useState<boolean>(false);

  const validateField = (item: any) => {
    if (item.type === "date") {
      if (!item.value || !item.value.toString().length) {
        return !item.nullable;
      } else {
        return isNaN(Date.parse(item.value));
      }
    }
    if (item.type !== "boolean") {
      if (item.internal_name === "late_fee_structure") {
        return !isLateFeeDynamicFormValid;
      } else if (!item.nullable) {
        return !item.value || !item.value.toString().length;
      }
    }
    return false;
  };

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
          <Box display="flex" flexDirection="column" mt={2}>
            <ContractTermsForm
              isProductTypeEditable
              isStartDateEditable
              contract={contract}
              validateField={validateField}
              currentJSONConfig={currentJSONConfig}
              setContract={setContract}
              setCurrentJSONConfig={setCurrentJSONConfig}
              setIsLateFeeDynamicFormValid={setIsLateFeeDynamicFormValid}
            />
          </Box>
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
