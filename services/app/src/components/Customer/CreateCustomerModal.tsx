import { Box, Button, Divider, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import AutocompleteCompany from "components/Shared/Company/AutocompleteCompany";
import Modal from "components/Shared/Modal/Modal";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractsInsertInput,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { createCustomer } from "lib/api/companies";
import {
  ProductConfigField,
  createProductConfigFieldsFromProductType,
  createProductConfigForServer,
  isProductConfigFieldInvalid,
} from "lib/contracts";
import { ProductTypeEnum } from "lib/enum";
import { useEffect, useState } from "react";

interface Props {
  handleClose: () => void;
  setSelectedTabIndex: (index: number) => void;
}

export default function CreateCustomerModal({
  handleClose,
  setSelectedTabIndex,
}: Props) {
  const snackbar = useSnackbar();

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
        createProductConfigFieldsFromProductType(
          contract.product_type as ProductTypeEnum
        )
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
          contract.product_type as ProductTypeEnum,
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
          <Typography variant={"body2"}>
            <strong>Select existing company</strong>
          </Typography>
          <Typography variant={"subtitle2"} color={"textSecondary"}>
            To create a customer profile, you have to choose an existing
            company, please select this existing company in the dropdown below.
          </Typography>
          <Box mt={2}>
            <AutocompleteCompany
              textFieldLabel="Select existing company (search by name or license)"
              onChange={(selectedCompanyId) =>
                setCustomer({ ...customer, id: selectedCompanyId })
              }
            />
          </Box>
          <Box mt={2} mb={-1}>
            <Alert severity="info">
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  <Text textVariant={TextVariants.SmallLabel}>
                    If you want to create a new company, click the button.
                  </Text>
                </Box>
                <Box display="flex" pt={0.5} mt={-1}>
                  <Button
                    color="default"
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      handleClose();
                      setSelectedTabIndex(3);
                    }}
                  >
                    Click Here
                  </Button>
                </Box>
              </Box>
            </Alert>
          </Box>
        </Box>
      </Box>
      <Box mt={4}>
        <Divider />
      </Box>
      <Box mt={2}>
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
