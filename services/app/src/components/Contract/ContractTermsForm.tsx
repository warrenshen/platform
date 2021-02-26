import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DatePicker from "components/Shared/Dates/DatePicker";
import { ContractsInsertInput, ProductTypeEnum } from "generated/graphql";
import { AllProductTypes, ProductTypeToLabel } from "lib/enum";
import { groupBy } from "lodash";
import { ChangeEvent, useMemo } from "react";

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
  isProductTypeEditable?: boolean;
  isStartDateEditable?: boolean;
  errMsg?: string;
  contract: ContractsInsertInput;
  currentJSONConfig: any;
  setContract: (contract: ContractsInsertInput) => void;
  setCurrentJSONConfig: (jsonConfig: any) => void;
}

function ContractTermsForm({
  isProductTypeEditable = false,
  isStartDateEditable = false,
  errMsg = "",
  contract,
  currentJSONConfig,
  setContract,
  setCurrentJSONConfig,
}: Props) {
  const classes = useStyles();

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

  const renderSwitch = (item: any) => {
    switch (item.type) {
      case "date":
        return (
          <DatePicker
            className={classes.datePicker}
            id={item.internal_name}
            error={errMsg.length > 0 && validateField(item)}
            label={item.display_name}
            required={!item.nullable}
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
            error={errMsg.length > 0 && validateField(item)}
            currencySymbol={getSymbol(item.format)}
            outputFormat="string"
            minimumValue="0"
            maximumValue={item.format === "percentage" ? "100" : undefined}
            textAlign="left"
            required={!item.nullable}
            value={item.value || ""}
            modifyValueOnWheel={false}
            onChange={(_event: any, value: string) =>
              findAndReplaceInJSON(item, value)
            }
          />
        );
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Checkbox
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
            className={classes.inputField}
            error={errMsg.length > 0 && validateField(item)}
            label={item.display_name}
            placeholder=""
            required={!item.nullable}
            value={item.value || ""}
            onChange={({ target: { value } }) =>
              findAndReplaceInJSON(
                item,
                item.type === "integer" ? value.replace(/[^0-9]/g, "") : value
              )
            }
          />
        );
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box className={classes.section} mb={3}>
        <FormControl className={classes.inputField}>
          <InputLabel id="select-product-type-label">Product Type</InputLabel>
          <Select
            disabled={!isProductTypeEditable}
            id="select-product-type"
            labelId="select-product-type-label"
            value={contract?.product_type || ""}
            onChange={({ target: { value } }) => {
              setContract({
                ...contract,
                product_type: value as ProductTypeEnum,
                product_config:
                  value === contract.product_type
                    ? contract.product_config
                    : {},
              });
            }}
            style={{ width: 200 }}
          >
            {AllProductTypes.map((productType) => (
              <MenuItem key={productType} value={productType}>
                {ProductTypeToLabel[productType as ProductTypeEnum]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box mb={3}>
        <DatePicker
          disabled={!isStartDateEditable}
          className={classes.inputField}
          id="start-date-date-picker"
          label="Start Date"
          value={contract.start_date}
          onChange={(value) =>
            setContract({
              ...contract,
              start_date: value,
            })
          }
        />
      </Box>
      <Box mb={3}>
        <DatePicker
          className={classes.inputField}
          id="end-date-date-picker"
          label="Expected End Date"
          value={contract.end_date}
          onChange={(value) =>
            setContract({
              ...contract,
              end_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column">
        {Object.entries(sections).map(([sectionName, content]) => (
          <Box key={sectionName} className={classes.section}>
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
          </Box>
        ))}
        {errMsg && (
          <Box className={classes.errorBox} mt={3}>
            {errMsg}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ContractTermsForm;
