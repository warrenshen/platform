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
import useSnackbar from "hooks/useSnackbar";
import { createCustomer } from "lib/api/companies";
import {
  createProductConfigFieldsFromProductType,
  createProductConfigForServer,
} from "lib/contracts";
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

function CreateCustomerModal({ handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [customer, setCustomer] = useState<CompaniesInsertInput>({
    name: null,
    identifier: null,
    contract_name: null,
    dba_name: null,
  });
  const [companySetting] = useState<CompanySettingsInsertInput>({});
  const [contract, setContract] = useState<ContractsInsertInput>({
    product_type: null,
    start_date: null,
    end_date: null,
  });
  const [currentJSONConfig, setCurrentJSONConfig] = useState<any>({});

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (contract.product_type) {
      setCurrentJSONConfig(
        createProductConfigFieldsFromProductType(contract.product_type)
      );
    }
  }, [contract.product_type]);

  const [
    isLateFeeDynamicFormValid,
    setIsLateFeeDynamicFormValid,
  ] = useState<boolean>(false);

  const [
    isRepaymentSettlementTimelineValid,
    setIsRepaymentSettlementTimelineValid,
  ] = useState<boolean>(false);

  const isFieldInvalid = (item: any) => {
    if (item.type === "date") {
      if (!item.value || !item.value.toString().length) {
        return !item.nullable;
      } else {
        return isNaN(Date.parse(item.value));
      }
    } else if (item.type === "float") {
      if (!item.nullable) {
        return item.value === null || !item.value.toString().length;
      }
    } else if (item.type !== "boolean") {
      if (item.internal_name === "late_fee_structure") {
        return !isLateFeeDynamicFormValid;
      } else if (item.internal_name === "repayment_type_settlement_timeline") {
        return !isRepaymentSettlementTimelineValid;
      } else if (!item.nullable) {
        return !item.value || !item.value.toString().length;
      }
    }
    return false;
  };

  const handleClickCreate = async () => {
    if (!contract || !contract.product_type) {
      console.log("Developer error");
      return;
    }

    const error = Object.values(currentJSONConfig)
      .filter((item: any) => isFieldInvalid(item))
      .toString().length;
    if (error) {
      setErrMsg("Please complete all required fields.");
      return;
    }

    if (!contract || !contract.product_type) {
      console.log("Developer error");
      return;
    }
    setErrMsg("");

    const response = await createCustomer({
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
      snackbar.showError(`Could not create customer! Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Customer created.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !customer.name ||
    !customer.identifier ||
    !customer.contract_name ||
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
              label="Customer Name"
              placeholder="Distributor Example"
              value={customer.name || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, name: value })
              }
            />
          </Box>
          <Box mt={2}>
            <TextField
              className={classes.input}
              label="Company Identifier (Unique Short Name)"
              placeholder="DEI"
              value={customer.identifier || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, identifier: value })
              }
            />
          </Box>
          <Box mt={2}>
            <TextField
              className={classes.input}
              label="Contract Name"
              placeholder="DISTRIBUTOR EXAMPLE, INC."
              value={customer.contract_name || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, contract_name: value })
              }
            />
          </Box>
          <Box mt={2}>
            <TextField
              className={classes.input}
              label="DBA"
              placeholder="DBA 1, DBA 2"
              value={customer.dba_name || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, dba_name: value })
              }
            />
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h6">Contract Information</Typography>
          <Box display="flex" flexDirection="column" mt={2}>
            <ContractTermsForm
              isProductTypeEditable
              isStartDateEditable
              errMsg={errMsg}
              contract={contract}
              isFieldInvalid={isFieldInvalid}
              currentJSONConfig={currentJSONConfig}
              setContract={setContract}
              setCurrentJSONConfig={setCurrentJSONConfig}
              setIsLateFeeDynamicFormValid={setIsLateFeeDynamicFormValid}
              setIsRepaymentSettlementTimelineValid={
                setIsRepaymentSettlementTimelineValid
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isSubmitDisabled}
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

export default CreateCustomerModal;
