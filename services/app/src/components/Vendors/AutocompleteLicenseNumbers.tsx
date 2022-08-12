import { QueryLazyOptions } from "@apollo/client";
import { TextField } from "@material-ui/core";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { Exact } from "generated/graphql";
import { DebouncedFunc } from "lodash";

import LicenseNumberCard from "./LicenseNumberCard";

const filter = createFilterOptions<LicenseNumberOptionType>();

export interface LicenseNumberOptionType {
  inputValue?: string;
  license_number?: string;
  license_category?: string;
  legal_name?: string;
  us_state?: string;
}

interface Props {
  selectableLicenseNumbers: LicenseNumberOptionType[];
  onChange: (event: any, newValue: any) => void;
  debouncedLoadCompanyLicenses: DebouncedFunc<
    (
      options?:
        | QueryLazyOptions<
            Exact<{
              license_number_search: string;
            }>
          >
        | undefined
    ) => void
  >;
}

function AutocompleteLicenseNumbers({
  onChange,
  debouncedLoadCompanyLicenses,
  selectableLicenseNumbers,
}: Props) {
  return (
    <Autocomplete
      freeSolo
      multiple
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      defaultValue={[]}
      options={selectableLicenseNumbers}
      filterSelectedOptions
      filterOptions={(options, params) => {
        const filteredOptions = filter(options, params);
        if (params.inputValue !== "") {
          filteredOptions.push({
            inputValue: params.inputValue,
            license_number: `Add "${params.inputValue}"`,
          });
        }
        return filteredOptions;
      }}
      onInputChange={(_, newInputValue) => {
        newInputValue.length > 3 &&
          debouncedLoadCompanyLicenses({
            variables: { license_number_search: newInputValue + "%" },
          });
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            required
            label={"Cannabis License Number"}
            variant="outlined"
          />
        );
      }}
      getOptionLabel={(license) => {
        if (license.inputValue) {
          return license.inputValue;
        } else if (license.license_number) {
          return license.license_number || "";
        } else if (typeof license === "string") {
          return license;
        }
        return "";
      }}
      renderOption={(license) => <LicenseNumberCard {...license} />}
      onChange={onChange}
    />
  );
}

export default AutocompleteLicenseNumbers;
