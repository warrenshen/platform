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
  ContractFragment,
  Contracts,
  ContractsInsertInput,
  ProductTypeEnum,
  useGetContractQuery,
  useUpdateContractMutation,
} from "generated/graphql";
import { ProductTypeToContractTermsJson } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

const fieldsFilteringKeys = ["internal_name", "value"];

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

const formatValue = (type: any, value: any) => {
  switch (type) {
    case "float":
      return parseFloat(value);
    case "integer":
      return parseInt(value);
    case "date":
    case "string":
      return value;
    default:
      return value;
  }
};

interface Props {
  contractId: Contracts["id"];
  handleClose: () => void;
}

function UpdateContractModal({ contractId, handleClose }: Props) {
  const classes = useStyles();

  // Default Contract while existing one is loading.
  const newContract = {
    product_type: ProductTypeEnum.None,
    product_config: {},
  } as ContractsInsertInput;

  const [contract, setContract] = useState(newContract);

  const getExistingConfig = (existingContract: ContractFragment) => {
    // Template contract fields based on the JSON template (values are all empty).
    const templateContractFields = JSON.parse(
      ProductTypeToContractTermsJson[
        existingContract.product_type as ProductTypeEnum
      ]
    ).v1.fields;

    // Fill out the template contract fields based on the existing contract.
    if (
      existingContract.product_config &&
      Object.keys(existingContract.product_config).length
    ) {
      const existingContractFields = existingContract.product_config.v1.fields;
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

  const [currentJSONConfig, setCurrentJSONConfig] = useState<any>({});

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
        setCurrentJSONConfig(getExistingConfig(existingContract));
      }
    },
  });

  const [errMsg, setErrMsg] = useState("");

  const [updateContract] = useUpdateContractMutation();

  const handleSubmit = async () => {
    const error = Object.values(currentJSONConfig)
      .filter((item: any) => validateField(item))
      .toString().length;
    if (error) {
      setErrMsg("Please complete all required fields.");
      return;
    }

    setErrMsg("");
    const shortenedJSONConfig = currentJSONConfig.map((field: any) =>
      Object.assign(
        {},
        ...fieldsFilteringKeys.map((key) => ({
          [key]:
            key === "value" ? formatValue(field.type, field[key]) : field[key],
        }))
      )
    );
    const currentJSON = JSON.parse(
      ProductTypeToContractTermsJson[contract.product_type as ProductTypeEnum]
    );
    const productConfig = {
      ...currentJSON,
      v1: {
        ...currentJSON.v1,
        fields: shortenedJSONConfig,
      },
    };

    const response = await updateContract({
      variables: {
        contractId,
        contract: {
          end_date: contract.end_date,
          product_config: productConfig,
        },
      },
    });

    const savedContract = response.data?.update_contracts_by_pk;
    if (!savedContract) {
      alert("Could not update contract");
    } else {
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
