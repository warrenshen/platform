import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  makeStyles,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
} from "@material-ui/core";
import { useState, useMemo } from "react";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { ChangeEvent } from "react";
import { groupBy } from "lodash";
import DatePicker from "components/Shared/Dates/DatePicker";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import contractTermsJSON from "./inventory_contract_terms.json";

// Configuration which defines how to view and edit this contract
export type ContractConfig = {
  product_type: string;
  product_config: any;
  isViewOnly: boolean;
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
      return !item.value.toString().length;
    }
  }
  return false;
};

const formatValue = (type: any, value: any) => {
  switch (true) {
    case type === "float":
      return parseFloat(value);
    case type === "integer":
      return parseInt(value);
    case type === "date":
      return value && value !== null && value.length
        ? new Date(value).toLocaleDateString("en-US")
        : value;
    default:
      return value;
  }
};
interface Props {
  onClose: () => void;
  onSave: (newContractConfig: ContractConfig) => void | null;
  contractConfig: ContractConfig;
}

function ContractTermsModal(props: Props) {
  const classes = useStyles();

  const config = props.contractConfig;
  const [errMsg, setErrMsg] = useState<string>("");

  const getInitConfig = () => {
    const full = JSON.parse(JSON.stringify(contractTermsJSON.v1.fields));
    if (Object.keys(config.product_config).length) {
      const passed = config.product_config.v1.fields;
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
  const initConfig = getInitConfig();

  const [currentJSONConfig, setCurrentJSONConfig] = useState(initConfig);

  const sections = useMemo(() => groupBy(currentJSONConfig, (d) => d.section), [
    currentJSONConfig,
  ]);
  const viewOnly = config.isViewOnly;

  const findAndReplaceInJSON = (item: any, value: any) => {
    const foundIndex = currentJSONConfig.findIndex(
      (field: any) => field.internal_name === item.internal_name
    );
    currentJSONConfig[foundIndex].value = value;
    setCurrentJSONConfig([...currentJSONConfig]);
  };

  const setButtonHandler = (config: any) => {
    const error = Object.values(config)
      .filter((item: any) => validateField(item))
      .toString().length;
    if (error) {
      setErrMsg("Please complete all required fields.");
    } else {
      errMsg.length && setErrMsg("");
      const shortenedJSONConfig = config.map((field: any) =>
        Object.assign(
          {},
          ...fieldsFilteringKeys.map((key) => ({
            [key]:
              key === "value"
                ? formatValue(field.type, field[key])
                : field[key],
          }))
        )
      );
      const currentJSON = JSON.parse(JSON.stringify(contractTermsJSON));
      currentJSON.v1.fields = shortenedJSONConfig;
      props.onSave({
        product_type: config.product_type,
        product_config: currentJSON,
        isViewOnly: config.isViewOnly,
      });
    }
  };

  const renderSwitch = (item: any) => {
    switch (true) {
      case item.type === "date":
        return (
          <DatePicker
            className={classes.datePicker}
            id={item.internal_name}
            disabled={viewOnly}
            error={errMsg.length > 0 && validateField(item)}
            label={item.display_name}
            disablePast={true}
            disableNonBankDays={true}
            required={!viewOnly && !item.nullable}
            value={item.value}
            onChange={(value: any) => {
              findAndReplaceInJSON(item, value);
            }}
          />
        );
      case item.type === "float":
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
            disabled={viewOnly}
            error={errMsg.length > 0 && validateField(item)}
            currencySymbol={getSymbol(item.format)}
            outputFormat="string"
            minimumValue="0"
            maximumValue={item.format === "percentage" ? "100" : undefined}
            textAlign="left"
            required={!viewOnly && !item.nullable}
            value={item.value || ""}
            modifyValueOnWheel={false}
            onChange={(_event: any, value: string) => {
              findAndReplaceInJSON(item, value);
            }}
          ></CurrencyTextField>
        );
      case item.type === "boolean":
        return (
          <FormControlLabel
            control={
              <Checkbox
                disabled={viewOnly}
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
            disabled={viewOnly}
            error={errMsg.length > 0 && validateField(item)}
            label={item.display_name}
            placeholder=""
            required={!viewOnly && !item.nullable}
            value={item.value || ""}
            onChange={({ target: { value } }) => {
              findAndReplaceInJSON(
                item,
                item.type === "integer" ? value.replace(/[^0-9]/g, "") : value
              );
            }}
          ></TextField>
        );
    }
  };

  return (
    <Dialog open onClose={props.onClose} fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        Purchase Order Financing Contract
      </DialogTitle>
      <DialogContent style={{ height: 500 }}>
        <Box display="flex" flexDirection="column">
          {Object.entries(sections).map(([sectionName, content]) => (
            <div key={sectionName} className={classes.section}>
              <div className={classes.sectionName}>{sectionName}</div>
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
            <Button onClick={props.onClose}>Cancel</Button>
            {!config.isViewOnly && (
              <Button
                onClick={() => {
                  setButtonHandler(currentJSONConfig);
                }}
                variant="contained"
                color="primary"
                type="submit"
              >
                Set
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ContractTermsModal;
