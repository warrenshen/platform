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
import DateInput from "components/Shared/FormInputs/DateInput";
import JsonFormInput from "components/Shared/FormInputs/JsonFormInput";
import { format, parse } from "date-fns";
import { ContractsInsertInput, ProductTypeEnum } from "generated/graphql";
import {
  ContractTermNames,
  getContractTermBankDescription,
  getContractTermCustomerDescription,
  getContractTermDataCy,
  getContractTermIsHiddenIfNull,
  isProductConfigFieldInvalid,
  ProductConfigField,
} from "lib/contracts";
import { DateFormatServer } from "lib/date";
import { AllProductTypes, ProductTypeToLabel } from "lib/enum";
import { groupBy } from "lodash";
import { ChangeEvent, useMemo } from "react";
import SelectTimezoneMaterialUi from "select-timezone-material-ui";

const useStyles = makeStyles({
  section: {
    fontWeight: 400,
    fontSize: "18px",
  },
  sectionName: {
    marginBottom: "1.5rem",
  },
  datePicker: {
    width: 300,
    marginTop: 0,
    marginBottom: 0,
  },
  errorBox: {
    color: "red",
    bottom: "1rem",
  },
});

interface Props {
  isProductTypeEditable?: boolean;
  isStartDateEditable?: boolean;
  errMsg?: string;
  contract: ContractsInsertInput;
  currentJSONConfig: any;
  setContract: (contract: ContractsInsertInput) => void;
  setCurrentJSONConfig: (jsonConfig: any) => void;
}

export default function ContractTermsForm({
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

  // Dynamic interest rate parsing
  const parseDynamicInterestRateFormValue = (item: any, value: any): void => {
    const mappedValue = value.map((v: any) => {
      const [start_date_key, end_date_key, interest_rate_key] = Object.keys(v);

      const key =
        v[start_date_key].toString() + "-" + v[end_date_key].toString();
      return {
        [key]: v[interest_rate_key] ? parseFloat(v[interest_rate_key]) : null,
      };
    });
    const dynamicFormValue = Object.assign({}, ...mappedValue);
    findAndReplaceInJSON(item, dynamicFormValue);
  };

  const getDynamicInterestRateFormInitialValues = (
    item: any
  ): any[][] | undefined => {
    const { fields, value } = item;
    let result;
    if (value) {
      result = [];
      const [
        start_date_display_key,
        end_date_display_key,
        interest_rate_display_key,
      ] = fields.map((f: any) => f.display_name);
      const keys = Object.keys(value);
      keys.forEach((key) => {
        if (!key) {
          key = "";
        }
        const parts = key.split("-");
        const startDate = parts[0];
        const endDate = parts.length === 2 ? parts[1] : "";

        result.push({
          [start_date_display_key]: startDate,
          [end_date_display_key]: endDate,
          [interest_rate_display_key]: value[key] ? value[key].toString() : "",
        });
      });
    }
    return result;
  };

  // Late fee parsing

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

  const renderSwitch = (item: ProductConfigField) => {
    const dataCy = getContractTermDataCy(item.internal_name)
      ? `contract-terms-form-input-${getContractTermDataCy(item.internal_name)}`
      : undefined;

    if (item.type === "date") {
      return (
        <DateInput
          dataCy={dataCy}
          className={classes.datePicker}
          id={item.internal_name}
          error={errMsg.length > 0 && isProductConfigFieldInvalid(item)}
          label={item.display_name}
          required={!item.nullable}
          value={item.value || null}
          onChange={(value: any) => findAndReplaceInJSON(item, value)}
        />
      );
    } else if (item.type === "timezone") {
      return (
        <SelectTimezoneMaterialUi
          data-cy={dataCy}
          showTimezoneOffset
          id={item.internal_name}
          label="Timezone"
          helperText="Please select a timezone from the list"
          timezoneName={item.value || null}
          onChange={(timezoneName) => findAndReplaceInJSON(item, timezoneName)}
        />
      );
    } else if (item.type === "float") {
      const getSymbol = (format: string | undefined) => {
        switch (format) {
          case "percentage":
            return "%";
          case "currency":
            return "$";
          default:
            return "";
        }
      };
      return (
        <CurrencyInput
          dataCy={dataCy}
          isRequired={!item.nullable}
          currencySymbol={getSymbol(item.format)}
          decimalPlaces={item.format === "percentage" ? 8 : 2}
          minimumValue={0}
          maximumValue={item.format === "percentage" ? 100 : undefined}
          label={item.display_name}
          error={
            errMsg.length > 0 && isProductConfigFieldInvalid(item)
              ? errMsg
              : undefined
          }
          value={item.value !== undefined ? item.value : null}
          handleChange={(value) => findAndReplaceInJSON(item, value)}
        />
      );
    } else if (item.type === "boolean") {
      return (
        <FormControlLabel
          control={
            <Checkbox
              data-cy={dataCy}
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
    } else if (item.internal_name === "dynamic_interest_rate") {
      return (
        <JsonFormInput
          dataCy={dataCy}
          fields={item.fields}
          name={item.display_name}
          initialValues={getDynamicInterestRateFormInitialValues(item)}
          showValidationResult={errMsg.length > 0}
          handleChange={(value: any) =>
            parseDynamicInterestRateFormValue(item, value)
          }
        />
      );
    } else if (item.internal_name === "late_fee_structure") {
      return (
        <JsonFormInput
          dataCy={dataCy}
          fields={item.fields}
          name={item.display_name}
          initialValues={getLateFeeDynamicFormInitialValues(item)}
          showValidationResult={errMsg.length > 0}
          handleChange={(value: any) =>
            parseLateFeeDynamicFormValue(item, value)
          }
        />
      );
    } else if (item.internal_name === "repayment_type_settlement_timeline") {
      return (
        <JsonFormInput
          dataCy={dataCy}
          fields={item.fields}
          name={item.display_name}
          initialValues={getRepaymentSettlementTimelineInitialValues(item)}
          showValidationResult={false}
          handleChange={(value: any) =>
            parseRepaymentSettlementTimelineFormValue(item, value)
          }
        />
      );
    } else {
      return (
        <TextField
          data-cy={dataCy}
          error={errMsg.length > 0 && isProductConfigFieldInvalid(item)}
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
      <Box display="flex" flexDirection="column" className={classes.section}>
        <FormControl>
          <InputLabel id="select-product-type-label">Product Type</InputLabel>
          <Select
            data-cy={"contract-form-input-product-type"}
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
          >
            {AllProductTypes.map((productType, index) => (
              <MenuItem
                data-cy={`contract-form-input-product-type-menu-item-${
                  index + 1
                }`}
                key={productType}
                value={productType}
              >
                {ProductTypeToLabel[productType as ProductTypeEnum]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          dataCy={"contract-form-input-start-date"}
          disabled={!isStartDateEditable}
          id="start-date-date-picker"
          label="Start Date"
          value={contract.start_date}
          onChange={(value) => {
            // Set start date and end date (one year after start date).
            const startDateObject = value
              ? parse(value, DateFormatServer, new Date())
              : null;
            const endDateObject = startDateObject
              ? startDateObject.setFullYear(startDateObject.getFullYear() + 1)
              : null;
            const endDate = endDateObject
              ? format(endDateObject, DateFormatServer)
              : null;
            setContract({
              ...contract,
              start_date: value,
              end_date: endDate,
            });
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          dataCy={"contract-form-input-end-date"}
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
          <Box key={sectionName} className={classes.section} mt={6}>
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
                      {getContractTermIsHiddenIfNull(
                        item.internal_name as ContractTermNames
                      ) && (
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
      </Box>
      {errMsg && (
        <Box className={classes.errorBox} mt={3}>
          {errMsg}
        </Box>
      )}
    </Box>
  );
}
