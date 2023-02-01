import { FormControl, MenuItem, TextField } from "@material-ui/core";

interface Props {
  value: any;
  defaultValue?: any;
  label: string;
  options: any[];
  optionDisplayMapper?: Record<string, string>;
  id: string;
  dataCy?: string;
  variant?: "outlined" | "standard" | "filled";
  setValue: (value: string) => void;
}

export default function SelectDropdown({
  value,
  defaultValue,
  label,
  options,
  optionDisplayMapper,
  id,
  dataCy,
  variant = "outlined",
  setValue,
}: Props) {
  return (
    <FormControl fullWidth>
      <TextField
        id={id}
        data-cy={dataCy}
        value={value}
        defaultValue={defaultValue}
        label={label}
        select
        variant={variant}
        onChange={({ target: { value } }) => setValue(value as string)}
      >
        {options.map((item: string, index: number) => {
          return (
            <MenuItem
              data-cy={`${dataCy}-item-${index}`}
              value={item}
              key={index}
            >
              {optionDisplayMapper ? optionDisplayMapper[item] : item}
            </MenuItem>
          );
        })}
      </TextField>
    </FormControl>
  );
}
