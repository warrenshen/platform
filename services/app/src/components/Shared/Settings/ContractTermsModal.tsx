import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DatePicker from "components/Shared/Dates/DatePicker";
import {
  ContractFragment,
  Contracts,
  ContractsInsertInput,
  ProductTypeEnum,
  useContractQuery,
  useUpdateContractMutation,
} from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { groupBy, isNull, mergeWith } from "lodash";
import { ChangeEvent, useMemo, useState } from "react";
import InventoryContractTermsJson from "./inventory_contract_terms.json";
import LineOfCreditContractTermsJson from "./line_of_credit_contract_terms.json";

// Configuration which defines how to view and edit this contract
export type ContractConfig = {
  product_type: ProductTypeEnum;
  product_config: any;
  isViewOnly: boolean;
};

const ProductTypeToContractTermsJson = {
  [ProductTypeEnum.InventoryFinancing]: JSON.stringify(
    InventoryContractTermsJson
  ),
  [ProductTypeEnum.InvoiceFinancing]: JSON.stringify({}),
  [ProductTypeEnum.LineOfCredit]: JSON.stringify(LineOfCreditContractTermsJson),
  [ProductTypeEnum.PurchaseMoneyFinancing]: JSON.stringify({}),
  [ProductTypeEnum.None]: JSON.stringify({}),
};

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
  textField: {
    width: 300,
  },
  sectionName: {
    marginBottom: "1.5rem",
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
      return value;
    default:
      return value;
  }
};
interface Props {
  isViewOnly: boolean;
  contractId: Contracts["id"];
  onClose: () => void;
}

function ContractTermsModal({ isViewOnly, contractId, onClose }: Props) {
  const classes = useStyles();

  // Default Contract while existing one is loading.
  const newContract = {
    product_type: ProductTypeEnum.None,
    product_config: {},
  } as ContractsInsertInput;

  const [contract, setContract] = useState(newContract);

  const getExistingConfig = (existingContract: ContractFragment) => {
    const full = JSON.parse(
      ProductTypeToContractTermsJson[
        existingContract.product_type as ProductTypeEnum
      ]
    ).v1.fields;
    if (
      existingContract.product_config &&
      Object.keys(existingContract.product_config).length
    ) {
      const passed = existingContract.product_config.v1.fields;
      passed.forEach((item: any, i: any) => {
        if (item.value !== null || full[i].nullable) {
          full[i].value = item.value;
        }
      });
      return full;
    } else {
      return full;
    }
  };

  const [currentJSONConfig, setCurrentJSONConfig] = useState<any>({});

  const { loading: isExistingContractLoading } = useContractQuery({
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

  const sections = useMemo(() => groupBy(currentJSONConfig, (d) => d.section), [
    currentJSONConfig,
  ]);

  const findAndReplaceInJSON = (item: any, value: any) => {
    const foundIndex = currentJSONConfig.findIndex(
      (field: any) => field.internal_name === item.internal_name
    );
    currentJSONConfig[foundIndex].value = value;
    setCurrentJSONConfig([...currentJSONConfig]);
  };

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
          ...contract,
          product_config: productConfig,
        },
      },
    });

    const savedContract = response.data?.update_contracts_by_pk;
    if (!savedContract) {
      alert("Could not update contract");
    } else {
      onClose();
    }
  };

  const renderSwitch = (item: any) => {
    switch (item.type) {
      case "date":
        return (
          <DatePicker
            className={classes.datePicker}
            id={item.internal_name}
            disabled={isViewOnly}
            error={errMsg.length > 0 && validateField(item)}
            label={item.display_name}
            required={!isViewOnly && !item.nullable}
            value={item.value || null}
            onChange={(value: any) => findAndReplaceInJSON(item, value)}
          />
        );
      case "float":
        const getSymbol = (format: string) => {
          switch (true) {
            case format === "percentage":
              return "%";
            case format === "currency":
              return "$";
            default:
              return "";
          }
        };
        return (
          <CurrencyTextField
            style={{ width: 300 }}
            label={item.display_name}
            disabled={isViewOnly}
            error={errMsg.length > 0 && validateField(item)}
            currencySymbol={getSymbol(item.format)}
            outputFormat="string"
            minimumValue="0"
            maximumValue={item.format === "percentage" ? "100" : undefined}
            textAlign="left"
            required={!isViewOnly && !item.nullable}
            value={item.value || ""}
            modifyValueOnWheel={false}
            onChange={(_event: any, value: string) =>
              findAndReplaceInJSON(item, value)
            }
          ></CurrencyTextField>
        );
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Checkbox
                disabled={isViewOnly}
                checked={!!item.value}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  findAndReplaceInJSON(item, event.target.checked);
                }}
                color="primary"
              />
            }
            label={item.display_name}
          />
        );
      default:
        return (
          <TextField
            className={classes.textField}
            disabled={isViewOnly}
            error={errMsg.length > 0 && validateField(item)}
            label={item.display_name}
            placeholder=""
            required={!isViewOnly && !item.nullable}
            value={item.value || ""}
            onChange={({ target: { value } }) =>
              findAndReplaceInJSON(
                item,
                item.type === "integer" ? value.replace(/[^0-9]/g, "") : value
              )
            }
          ></TextField>
        );
    }
  };

  const isDialogReady = !isExistingContractLoading;

  return isDialogReady ? (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        {`${
          ProductTypeToLabel[contract.product_type as ProductTypeEnum]
        } Contract`}
      </DialogTitle>
      <DialogContent style={{ height: 500 }}>
        <Box display="flex" flexDirection="column">
          {Object.entries(sections).map(([sectionName, content]) => (
            <div key={sectionName} className={classes.section}>
              <Typography variant="h6" className={classes.sectionName}>
                {sectionName}
              </Typography>
              {content.map((item) => (
                <Box key={item.internal_name} mt={2}>
                  <FormControl fullWidth>
                    {renderSwitch(item)}
                    <FormHelperText id={item.display_name}>
                      {item.description}
                    </FormHelperText>
                  </FormControl>
                </Box>
              ))}
            </div>
          ))}
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
            <Button onClick={onClose}>Cancel</Button>
            {!isViewOnly && (
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                type="submit"
              >
                Save
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default ContractTermsModal;
