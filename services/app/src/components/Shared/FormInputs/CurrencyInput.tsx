import CurrencyTextField from "@unicef/material-ui-currency-textfield";

interface Props {
  isDisabled?: boolean;
  isRequired?: boolean;
  textAlign?: "left" | "right";
  currencySymbol?: "$" | "%" | ""; // This props allows us to use this component for non-currency number input fields.
  decimalPlaces?: number;
  minimumValue?: number;
  maximumValue?: number;
  label: string;
  error?: string;
  value: number;
  handleChange?: (value: number) => void;
}

function CurrencyInput({
  isDisabled = false,
  isRequired = false,
  textAlign = "left",
  currencySymbol = "$",
  decimalPlaces = 2,
  minimumValue,
  maximumValue,
  label,
  error,
  value,
  handleChange,
}: Props) {
  return (
    <CurrencyTextField
      disabled={isDisabled}
      required={isRequired}
      modifyValueOnWheel={false}
      currencySymbol={currencySymbol}
      outputFormat={"number"}
      decimalPlaces={decimalPlaces}
      minimumValue={minimumValue?.toString()}
      maximumValue={maximumValue?.toString()}
      textAlign={textAlign}
      label={label}
      error={error || ""}
      value={value}
      onChange={(_event: any, value: number) =>
        handleChange && handleChange(value)
      }
    />
  );
}

export default CurrencyInput;
