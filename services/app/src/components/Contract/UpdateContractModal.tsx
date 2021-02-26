import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import ContractTermsForm from "components/Contract/ContractTermsForm";
import {
  Contracts,
  ContractsInsertInput,
  ProductTypeEnum,
  useGetContractQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import {
  createProductConfigFieldsFromContract,
  createProductConfigForServer,
  ProductConfigField,
  updateContract,
} from "lib/customer/contracts";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

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

const validateField = (item: any) => {
  if (item.type === "date") {
    if (!item.value || !item.value.toString().length) {
      return !item.nullable;
    } else {
      return isNaN(Date.parse(item.value));
    }
  }
  if (item.type !== "boolean") {
    if (!item.nullable) {
      return !item.value || !item.value.toString().length;
    }
  }
  return false;
};

interface Props {
  contractId: Contracts["id"];
  handleClose: () => void;
}

function UpdateContractModal({ contractId, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  // Default Contract while existing one is loading.
  const newContract = {
    product_type: ProductTypeEnum.None,
    product_config: {},
  } as ContractsInsertInput;

  const [contract, setContract] = useState(newContract);

  const [currentJSONConfig, setCurrentJSONConfig] = useState<
    ProductConfigField[]
  >([]);

  const { loading: isExistingContractLoading } = useGetContractQuery({
    variables: { id: contractId },
    onCompleted: (data) => {
      const existingContract = data?.contracts_by_pk;
      if (!existingContract) {
        alert("Error quertying contract");
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

  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async () => {
    const error = Object.values(currentJSONConfig)
      .filter((item: any) => validateField(item))
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

    const response = await updateContract({
      contract_id: contractId,
      contract_fields: {
        product_type: contract.product_type,
        start_date: contract.start_date,
        end_date: contract.end_date,
        product_config: productConfig,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Error: could not update contract! Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Success! Contract updated successfully.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingContractLoading;

  return isDialogReady ? (
    <Dialog open onClose={handleClose} fullWidth>
      <DialogTitle className={classes.dialogTitle}>Edit Contract</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <ContractTermsForm
            errMsg={errMsg}
            contract={contract}
            currentJSONConfig={currentJSONConfig}
            setContract={setContract}
            setCurrentJSONConfig={setCurrentJSONConfig}
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

export default UpdateContractModal;
