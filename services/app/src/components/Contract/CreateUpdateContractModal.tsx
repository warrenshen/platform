import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  Contracts,
  ContractsInsertInput,
  useGetContractQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { addContractMutation, updateContractMutation } from "lib/api/contracts";
import {
  createProductConfigFieldsFromContract,
  createProductConfigFieldsFromProductType,
  createProductConfigForServer,
  isProductConfigFieldInvalid,
  ProductConfigField,
} from "lib/contracts";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useEffect, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  contractId: Contracts["id"] | null;
  handleClose: () => void;
}

export default function CreateUpdateContractModal({
  actionType,
  companyId,
  contractId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  // Default Contract while existing one is loading.
  const newContract = {
    product_type: null,
    start_date: null,
    end_date: null,
    product_config: {},
  } as ContractsInsertInput;

  const [contract, setContract] = useState(newContract);

  const [currentJSONConfig, setCurrentJSONConfig] = useState<
    ProductConfigField[]
  >([]);

  const { loading: isExistingContractLoading } = useGetContractQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: contractId,
    },
    onCompleted: (data) => {
      const existingContract = data?.contracts_by_pk;
      if (!existingContract) {
        alert("Error querying contract");
      } else {
        setContract(
          mergeWith(newContract, existingContract, (a, b) =>
            isNull(b) ? a : b
          )
        );
        setCurrentJSONConfig(
          createProductConfigFieldsFromContract(existingContract)
        );
      }
    },
  });

  useEffect(() => {
    if (actionType === ActionType.New && contract.product_type) {
      setCurrentJSONConfig(
        createProductConfigFieldsFromProductType(contract.product_type)
      );
    }
  }, [actionType, contract.product_type]);

  const [errMsg, setErrMsg] = useState("");

  const [addContract, { loading: isAddContractLoading }] = useCustomMutation(
    addContractMutation
  );

  const [
    updateContract,
    { loading: isUpdateContractLoading },
  ] = useCustomMutation(updateContractMutation);

  const handleClickSubmit = async () => {
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

    const productConfig = createProductConfigForServer(
      contract.product_type,
      currentJSONConfig
    );

    const contractFields = {
      product_type: contract.product_type,
      start_date: contract.start_date,
      end_date: contract.end_date,
      product_config: productConfig,
    };
    const response =
      actionType === ActionType.New
        ? await addContract({
            variables: {
              company_id: companyId,
              contract_fields: contractFields,
            },
          })
        : await updateContract({
            variables: {
              contract_id: contractId,
              contract_fields: contractFields,
            },
          });

    if (response.status !== "OK") {
      snackbar.showError(`Could not update contract. Reason: ${response.msg}`);
    } else {
      snackbar.showSuccess("Contract updated.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingContractLoading;
  const isSubmitDisabled =
    !isDialogReady || isAddContractLoading || isUpdateContractLoading;

  return isDialogReady ? (
    <Modal
      dataCy={"create-contract-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={`${actionType === ActionType.Update ? "Edit" : "Create"} Contract`}
      contentWidth={600}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box display="flex" flexDirection="column">
        <Box mt={2} mb={6}>
          <Alert severity="info">
            <Typography variant="body1">
              Note: only bank admins may create / edit contracts (you are a bank
              admin). Description text in green is only visible to bank users.
            </Typography>
          </Alert>
        </Box>
        <ContractTermsForm
          isProductTypeEditable={actionType === ActionType.New}
          isStartDateEditable
          errMsg={errMsg}
          contract={contract}
          currentJSONConfig={currentJSONConfig}
          setContract={setContract}
          setCurrentJSONConfig={setCurrentJSONConfig}
        />
      </Box>
    </Modal>
  ) : null;
}
