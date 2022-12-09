import { QueryLazyOptions } from "@apollo/client";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Exact } from "generated/graphql";
import { DebouncedFunc } from "lodash";

interface Props {
  label: string;
  selectableOptions: any[];
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
  value?: any;
  getOptionLabel: (option: any) => string;
  renderOption?: (option: any) => JSX.Element;
  onChange: (event: any, newValue: any) => void;
}

const AutocompleteSelectDropdown = ({
  label,
  debouncedLoadOptions,
  selectableOptions,
  value,
  getOptionLabel,
  renderOption,
  onChange,
}: Props) => {
  return (
    <Autocomplete
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      defaultValue={[]}
      value={value}
      options={selectableOptions}
      onInputChange={(_, newInputValue) => {
        newInputValue.length > 2 &&
          debouncedLoadOptions({
            variables: { search_prefix: "%" + newInputValue + "%" },
          });
      }}
      renderInput={(params) => {
        return (
          <TextField {...params} required label={label} variant="outlined" />
        );
      }}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      onChange={onChange}
    />
  );
};

export default AutocompleteSelectDropdown;
