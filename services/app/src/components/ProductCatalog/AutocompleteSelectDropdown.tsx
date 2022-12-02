import { QueryLazyOptions } from "@apollo/client";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Exact } from "generated/graphql";
import { DebouncedFunc } from "lodash";

interface Props {
  label: string;
  selectableOptions: any[];
  getOptionLabel: (option: any) => string;
  onChange: (event: any, newValue: any) => void;
  debouncedLoadOptions: DebouncedFunc<
    (
      options?:
        | QueryLazyOptions<
            Exact<{
              search_prefix: string;
            }>
          >
        | undefined
    ) => void
  >;
}

const AutocompleteSelectDropdown = ({
  label,
  debouncedLoadOptions,
  selectableOptions,
  getOptionLabel,
  onChange,
}: Props) => {
  return (
    <Autocomplete
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      defaultValue={[]}
      options={selectableOptions}
      onInputChange={(_, newInputValue) => {
        newInputValue.length > 2 &&
          debouncedLoadOptions({
            variables: { search_prefix: newInputValue + "%" },
          });
      }}
      renderInput={(params) => {
        return (
          <TextField {...params} required label={label} variant="outlined" />
        );
      }}
      getOptionLabel={getOptionLabel}
      onChange={onChange}
    />
  );
};

export default AutocompleteSelectDropdown;
