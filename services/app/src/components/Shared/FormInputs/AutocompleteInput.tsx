import { TextField } from "@material-ui/core";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { useMemo } from "react";

const filter = createFilterOptions();

interface AutocompleteOption {
  label: string;
  value: string;
}

interface FilterOptionsState {
  inputValue: string;
  getOptionLabel: () => string;
}

interface Props {
  dataCy?: string;
  id: string;
  label: string;
  value: string;
  options: string[];
  setValue: (value: string | null) => void;
}

/**
 * Autocomplete input with a list of known options to
 * choose from and support for a new custom option.
 *
 * Note: currently only supports integer values.
 */
export default function AutocompleteInput({
  dataCy,
  id,
  label,
  value,
  options,
  setValue,
}: Props) {
  const formattedOptions = useMemo(
    () =>
      options.map((option) => ({
        label: option,
        value: option,
      })),
    [options]
  );

  return (
    <Autocomplete
      data-cy={dataCy}
      id={`auto-complete-${id}`}
      autoHighlight
      clearOnBlur
      freeSolo
      selectOnFocus
      handleHomeEndKeys
      value={{ label: value, value: value }}
      options={formattedOptions}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          data-cy={`${dataCy}-text-field`}
          {...params}
          label={label}
          variant="outlined"
          helperText={
            !value ? "Select number, or type to enter a custom number" : ""
          }
        />
      )}
      onChange={(event, option) => {
        let formattedValue;
        if (typeof option === "string") {
          formattedValue = option.replace(/[^0-9]/g, "");
        } else if (option && option.value) {
          formattedValue = option.value.replace(/[^0-9]/g, "");
        } else {
          formattedValue = null;
        }
        setValue(!!formattedValue ? formattedValue : null);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(
          options,
          params as FilterOptionsState
        ) as AutocompleteOption[];

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.label
        );
        if (inputValue !== "" && !isExisting) {
          filtered.splice(0, 0, {
            label: `Add "${inputValue}"`,
            value: inputValue,
          });
        }

        return filtered;
      }}
    />
  );
}
