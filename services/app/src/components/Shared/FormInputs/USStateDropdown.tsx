import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from "@material-ui/core";
import { USStates } from "lib/enum";

interface Props {
  isMetrcOnly?: boolean;
  dataCy?: string;
  helperText?: string;
  id?: string;
  value: string | null;
  setValue: (value: string) => void;
}

const SupportedMetrcUSState = [
  "AK",
  "CA",
  "CO",
  "MA",
  "MD",
  "ME",
  "MI",
  "MT",
  "OH",
  "OK",
  "OR",
  "WV",
];

export default function USStateDropdown({
  isMetrcOnly = false,
  dataCy,
  helperText,
  id,
  value,
  setValue,
}: Props) {
  const filteredUSStates = isMetrcOnly
    ? SupportedMetrcUSState
    : Object.keys(USStates);

  return (
    <FormControl>
      <FormHelperText>US State *</FormHelperText>
      <Select
        data-cy={dataCy}
        id={id || "us-state-dropdown"}
        renderValue={() => value || ""}
        value={value}
        onChange={({ target: { value } }) => setValue(value as string)}
      >
        {filteredUSStates.map((key: string) => {
          return (
            <MenuItem
              data-cy={"us-state-dropdown-item"}
              classes={{
                root: "us-state-option",
              }}
              key={USStates[key].abbreviation}
              value={USStates[key].abbreviation}
            >
              {`${USStates[key].abbreviation} (${USStates[key].full})`}
            </MenuItem>
          );
        })}
      </Select>
      {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
