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
  value: number | null;
  handleChange?: (value: number | null) => void;
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
      emptyInputBehavior={"null"}
      outputFormat={"number"}
      decimalPlaces={decimalPlaces}
      minimumValue={minimumValue?.toString()}
      maximumValue={maximumValue?.toString()}
      textAlign={textAlign}
      label={label}
      error={!!error}
      helperText={error || ""}
      value={value}
      onChange={(event: any, value: number) =>
        handleChange && handleChange(event.target.value !== "" ? value : null)
      }
    />
  );
}

export default CurrencyInput;
