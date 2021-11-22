import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  CompanyLicenseFragment,
  useGetCompanyLicensesByLicenseNumberQuery,
} from "generated/graphql";
import { useMemo, useState } from "react";

interface Props {
  handleSelectCompanyLicense: (
    selectedCompanyLicense: CompanyLicenseFragment
  ) => void;
}

export default function CompanyLicenseAutocomplete({
  handleSelectCompanyLicense,
}: Props) {
  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  const { data, error } = useGetCompanyLicensesByLicenseNumberQuery({
    fetchPolicy: "network-only",
    variables: {
      license_number: autocompleteInputValue,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const companyLicenses = useMemo(() => data?.company_licenses || [], [
    data?.company_licenses,
  ]);

  return (
    <Autocomplete
      autoHighlight
      id="auto-complete-company"
      options={companyLicenses}
      inputValue={autocompleteInputValue}
      value={null}
      getOptionLabel={(companyLicense) => `${companyLicense.license_number}`}
      renderInput={(params) => (
        <TextField
          {...params}
          label={"Search by license number"}
          variant="outlined"
        />
      )}
      onChange={(_event, companyLicense) => {
        if (companyLicense) {
          setAutocompleteInputValue("");
          handleSelectCompanyLicense(companyLicense);
        }
      }}
      onInputChange={(_event, value) => setAutocompleteInputValue(value)}
    />
  );
}
