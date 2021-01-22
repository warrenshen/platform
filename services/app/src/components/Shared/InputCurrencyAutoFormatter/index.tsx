import { useRef, useEffect } from "react";
import AutoNumeric from "autonumeric";
import { Input, InputLabel } from "@material-ui/core";

interface Props {
  label: string;
  defaultValue: string;
  onChange: (inputValue: number) => void;
}

function InputCurrencyAutoFormatter({ label, defaultValue, onChange }: Props) {
  const inputContainer = useRef<HTMLInputElement>();
  const autonumeric = useRef<AutoNumeric>();
  const value = useRef(defaultValue);

  useEffect(() => {
    if (inputContainer.current) {
      autonumeric.current = new AutoNumeric(
        inputContainer.current,
        value.current ?? 0,
        {
          // https://github.com/autoNumeric/autoNumeric/issues/684
          currencySymbol: "＄",
          maximumValue: "10000000000000",
          onInvalidPaste: "ignore",
        }
      );
    }
    return function cleanup() {
      autonumeric.current?.remove();
    };
  }, []);

  function handleInputChange() {
    onChange(autonumeric.current?.getNumber() ?? 0);
  }

  return (
    <>
      <InputLabel htmlFor="standard-adornment-amount" shrink={true}>
        {label}
      </InputLabel>
      <Input
        id="standard-adornment-amount"
        type="text"
        inputRef={inputContainer}
        onChange={handleInputChange}
      ></Input>
    </>
  );
}

export default InputCurrencyAutoFormatter;
