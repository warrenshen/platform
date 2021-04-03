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
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import JsonFormInput from "components/Shared/FormInputs/JsonFormInput";
import { ContractsInsertInput, ProductTypeEnum } from "generated/graphql";
import {
  ContractTermNames,
  getContractTermBankDescription,
  getContractTermCustomerDescription,
} from "lib/contracts";
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

interface Props {
  isProductTypeEditable?: boolean;
  isStartDateEditable?: boolean;
  errMsg?: string;
  contract: ContractsInsertInput;
  currentJSONConfig: any;
  isFieldInvalid: (item: any) => boolean;
  setContract: (contract: ContractsInsertInput) => void;
  setIsLateFeeDynamicFormValid: (isValid: boolean) => void;
  setIsRepaymentSettlementTimelineValid: (isValid: boolean) => void;
  setCurrentJSONConfig: (jsonConfig: any) => void;
}

function ContractTermsForm({
  isProductTypeEditable = false,
  isStartDateEditable = false,
  errMsg = "",
  contract,
  currentJSONConfig,
  isFieldInvalid,
  setContract,
  setCurrentJSONConfig,
  setIsLateFeeDynamicFormValid,
  setIsRepaymentSettlementTimelineValid,
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

  const parseLateFeeDynamicFormValue = (item: any, value: any): void => {
    const mappedValue = value.map((v: any) => {
      const [days_past_due, interest] = Object.keys(v);
      return { [v[days_past_due].toString()]: parseFloat(v[interest]) };
    });
    const lateFeeDynamicFormValue = Object.assign({}, ...mappedValue);
    findAndReplaceInJSON(item, lateFeeDynamicFormValue);
  };

  const getLateFeeDynamicFormInitialValues = (
    item: any
  ): any[][] | undefined => {
    const { fields, value } = item;
    let result;
    if (value) {
      result = [];
      const [days_past_due, interest] = fields.map((f: any) => f.display_name);
      const keys = Object.keys(value);
      keys.forEach((key) => {
        result.push({
          [days_past_due]: key ? key.toString() : "",
          [interest]: value[key] ? value[key].toString() : "",
        });
      });
    }
    return result;
  };

  // Transforms something that looks like this
  // ​
  // value = [
  //   { "Payment Type": "ach", "Days to Settle": "10" },
  //   { "Payment Type": "wire", "Days to Settle": "5" }
  // ]
  //
  // into something like looks like this
  //
  // mappedValue = [
  //   { ach: 10 },
  //   { wire: 5 },
  // ]
  // And then adds it to our state object

  const parseRepaymentSettlementTimelineFormValue = (
    item: any,
    value: any
  ): void => {
    const mappedValue = value.map((v: any) => {
      const [payment_type, days_to_settles] = Object.keys(v);
      return { [v[payment_type].toString()]: parseInt(v[days_to_settles]) };
    });
    const v = Object.assign({}, ...mappedValue);

    findAndReplaceInJSON(item, v);
  };

  const getRepaymentSettlementTimelineInitialValues = (
    item: any
  ): any[][] | undefined => {
    const { fields, value } = item;
    let result;
    if (value) {
      result = [];
      const [payment_type, days_to_settle] = fields.map(
        (f: any) => f.display_name
      );
      const keys = Object.keys(value);
      keys.forEach((key) => {
        result.push({
          [payment_type]: key ? key.toString() : "",
          [days_to_settle]: value[key] ? value[key].toString() : "",
        });
      });
    }
    return result;
  };

  const renderSwitch = (item: any) => {
    switch (true) {
      case item.type === "date":
        return (
          <DatePicker
            className={classes.datePicker}
            id={item.internal_name}
            error={errMsg.length > 0 && isFieldInvalid(item)}
            label={item.display_name}
            required={!item.nullable}
            value={item.value || null}
            onChange={(value: any) => findAndReplaceInJSON(item, value)}
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
          <CurrencyInput
            isRequired={!item.nullable}
            currencySymbol={getSymbol(item.format)}
            decimalPlaces={item.format === "percentage" ? 5 : 2}
            minimumValue={0}
            maximumValue={item.format === "percentage" ? 100 : undefined}
            label={item.display_name}
            error={
              errMsg.length > 0 && isFieldInvalid(item) ? errMsg : undefined
            }
            value={item.value !== undefined ? item.value : null}
            handleChange={(value: number) => findAndReplaceInJSON(item, value)}
          />
        );
      case item.type === "boolean":
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
      case item.internal_name === "late_fee_structure":
        return (
          <JsonFormInput
            fields={item.fields}
            name={item.display_name}
            initialValues={getLateFeeDynamicFormInitialValues(item)}
            showValidationResult={errMsg.length > 0}
            handleChange={(value: any, error) => {
              setIsLateFeeDynamicFormValid(error);
              parseLateFeeDynamicFormValue(item, value);
            }}
          />
        );
      case item.internal_name === "repayment_type_settlement_timeline":
        return (
          <JsonFormInput
            fields={item.fields}
            name={item.display_name}
            initialValues={getRepaymentSettlementTimelineInitialValues(item)}
            showValidationResult={false}
            handleChange={(value: any, error) => {
              setIsRepaymentSettlementTimelineValid(error);
              parseRepaymentSettlementTimelineFormValue(item, value);
            }}
          />
        );
      default:
        return (
          <TextField
            className={classes.inputField}
            error={errMsg.length > 0 && isFieldInvalid(item)}
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
            {content.map(
              (item) =>
                !item.is_hidden && (
                  <Box key={item.internal_name} mt={3}>
                    <FormControl fullWidth>
                      {renderSwitch(item)}
                      <FormHelperText id={"description-customer"}>
                        {getContractTermCustomerDescription(
                          item.internal_name as ContractTermNames
                        )}
                      </FormHelperText>
                      <FormHelperText id={"description-bank"}>
                        <Typography color="primary" variant="caption">
                          {getContractTermBankDescription(
                            item.internal_name as ContractTermNames
                          )}
                        </Typography>
                      </FormHelperText>
                      {item.is_hidden_if_null && (
                        <FormHelperText id={"description-hidden-if-blank"}>
                          <Typography color="primary" variant="caption">
                            ** This item will be hidden from the customer if you
                            leave it blank
                          </Typography>
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                )
            )}
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
