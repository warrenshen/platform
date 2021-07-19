import {
  Box,
  createStyles,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import AutocompleteCompany from "components/Shared/Company/AutocompleteCompany";
import Modal from "components/Shared/Modal/Modal";
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
  isProductConfigFieldInvalid,
  ProductConfigField,
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

export default function CreateCustomerModal({ handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [customer, setCustomer] = useState<CompaniesInsertInput>({
    id: null,
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
  const [currentJSONConfig, setCurrentJSONConfig] = useState<
    ProductConfigField[]
  >([]);

  const [errMsg, setErrMsg] = useState("");

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

    const invalidFields = Object.values(currentJSONConfig)
      .filter((item) => isProductConfigFieldInvalid(item))
      .map((item) => item.display_name);
    if (invalidFields.length > 0) {
      setErrMsg(`Please correct invalid fields: ${invalidFields.join(", ")}.`);
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

  const hasCustomerFieldsSet =
    customer.id ||
    (customer.name && customer.identifier && customer.contract_name);

  const isSubmitDisabled =
    !hasCustomerFieldsSet || !contract.product_type || !contract.start_date;

  const companyExists = !!customer.id;

  return (
    <Modal
      dataCy={"create-customer-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Customer"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickCreate}
    >
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Typography variant="h6">Company Information</Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant={"body1"}>
            Does the company above ALREADY exist in the system? If yes, please
            select this existing company in the dropdown below. If you do not
            select a company below, a NEW company will be created.
          </Typography>
          <Box mt={4}>
            <AutocompleteCompany
              textFieldLabel="Select existing company"
              onChange={(selectedCompanyId) =>
                setCustomer({ ...customer, id: selectedCompanyId })
              }
            />
          </Box>
        </Box>
        {!companyExists && (
          <Box mt={2}>
            <TextField
              data-cy={"customer-form-input-name"}
              className={classes.input}
              label="Customer Name"
              placeholder="Distributor Example"
              value={customer.name || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, name: value })
              }
            />
          </Box>
        )}
        {!companyExists && (
          <Box mt={2}>
            <TextField
              data-cy={"customer-form-input-identifier"}
              className={classes.input}
              label="Company Identifier (Unique Short Name)"
              placeholder="DE"
              value={customer.identifier || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, identifier: value })
              }
            />
          </Box>
        )}
        {!companyExists && (
          <Box mt={2}>
            <TextField
              data-cy={"customer-form-input-contract-name"}
              className={classes.input}
              label="Contract Name"
              placeholder="DISTRIBUTOR EXAMPLE, INC."
              value={customer.contract_name || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, contract_name: value })
              }
            />
          </Box>
        )}
        {!companyExists && (
          <Box mt={2}>
            <TextField
              data-cy={"customer-form-input-dba"}
              className={classes.input}
              label="DBA"
              placeholder="DBA 1, DBA 2"
              value={customer.dba_name || ""}
              onChange={({ target: { value } }) =>
                setCustomer({ ...customer, dba_name: value })
              }
            />
          </Box>
        )}
      </Box>
      <Box mt={6}>
        <Box mb={2}>
          <Typography variant="h6">Contract Information</Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <ContractTermsForm
            isProductTypeEditable
            isStartDateEditable
            errMsg={errMsg}
            contract={contract}
            currentJSONConfig={currentJSONConfig}
            setContract={setContract}
            setCurrentJSONConfig={setCurrentJSONConfig}
          />
        </Box>
      </Box>
    </Modal>
  );
}
