import CurrencyTextField from "@unicef/material-ui-currency-textfield";

interface Props {
  isDisabled?: boolean;
  isRequired?: boolean;
  textAlign?: "left" | "right";
  label: string;
  error?: string;
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  handleChange?: (value: number) => void;
}

function CurrencyInput({
  isDisabled = false,
  isRequired = false,
  textAlign = "left",
  label,
  error,
  value,
  minimumValue,
  maximumValue,
  handleChange,
}: Props) {
  return (
    <CurrencyTextField
      disabled={isDisabled}
      required={isRequired}
      modifyValueOnWheel={false}
      currencySymbol="$"
      outputFormat="number"
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      textAlign={textAlign}
      label={label}
      error={error || ""}
      value={value}
      handleChange={(value: number) => handleChange && handleChange(value)}
    />
  );
}

export default CurrencyInput;
