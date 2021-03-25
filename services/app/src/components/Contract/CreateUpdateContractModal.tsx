import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import {
  Companies,
  Contracts,
  ContractsInsertInput,
  useGetContractQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  addContractMutation,
  createProductConfigFieldsFromContract,
  createProductConfigFieldsFromProductType,
  createProductConfigForServer,
  ProductConfigField,
  updateContractMutation,
} from "lib/contracts";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
  section: {
    fontWeight: 400,
    fontSize: "18px",
    marginTop: "1.5rem",
    "&:first-of-type": {
      marginTop: 0,
    },
  },
  sectionName: {
    marginBottom: "1.5rem",
  },
  inputField: {
    width: 300,
  },
  datePicker: {
    width: 300,
    marginTop: 0,
    marginBottom: 0,
  },
  dialogTitle: {
    borderBottom: "1px solid #c7c7c7",
    marginBottom: "1rem",
  },
  errorBox: {
    color: "red",
    position: "absolute",
    bottom: "1rem",
  },
});

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  contractId: Contracts["id"] | null;
  handleClose: () => void;
}

function CreateUpdateContractModal({
  actionType,
  companyId,
  contractId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

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
  const [
    isLateFeeDynamicFormValid,
    setIsLateFeeDynamicFormValid,
  ] = useState<boolean>(false);

  const [
    isRepaymentSettlementTimelineValid,
    setIsRepaymentSettlementTimelineValid,
  ] = useState<boolean>(false);

  const { loading: isExistingContractLoading } = useGetContractQuery({
    skip: actionType === ActionType.New,
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

  const handleSubmit = async () => {
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
      snackbar.showError(
        `Error: could not update contract! Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Success! Contract updated.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingContractLoading;
  const isSubmitDisabled =
    !isDialogReady || isAddContractLoading || isUpdateContractLoading;

  return isDialogReady ? (
    <Dialog open onClose={handleClose} fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        {`${actionType === ActionType.Update ? "Edit" : "Create"} Contract`}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box mb={3}>
            <Alert severity="info">
              Note: only bank admins may create / edit contracts (you are a bank
              admin). Description text in blue is only visible by bank users.
            </Alert>
          </Box>
          <ContractTermsForm
            isProductTypeEditable={actionType === ActionType.New}
            isStartDateEditable
            errMsg={errMsg}
            contract={contract}
            currentJSONConfig={currentJSONConfig}
            isFieldInvalid={isFieldInvalid}
            setContract={setContract}
            setCurrentJSONConfig={setCurrentJSONConfig}
            setIsLateFeeDynamicFormValid={setIsLateFeeDynamicFormValid}
            setIsRepaymentSettlementTimelineValid={
              setIsRepaymentSettlementTimelineValid
            }
          />
          {errMsg && (
            <Box className={classes.errorBox} mt={3}>
              {errMsg}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              disabled={isSubmitDisabled}
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default CreateUpdateContractModal;
