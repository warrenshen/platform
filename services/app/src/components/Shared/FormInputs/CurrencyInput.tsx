import { Box } from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";

interface Props {
  dataCy?: string;
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
  defaultValue?: number | null;
  handleChange?: (value: number | null) => void;
  onBlur?: () => void;
}

export default function CurrencyInput({
  dataCy,
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
  defaultValue,
  handleChange,
  onBlur,
}: Props) {
  return (
    <Box display="flex" flexDirection="column" data-cy={dataCy}>
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
        defaultValue={defaultValue}
        onChange={(event: any, value: number) =>
          handleChange && handleChange(event.target.value !== "" ? value : null)
        }
        onBlur={onBlur}
      />
    </Box>
  );
}
