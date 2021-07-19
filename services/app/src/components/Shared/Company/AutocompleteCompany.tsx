import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Companies, useGetCompaniesWithLicensesQuery } from "generated/graphql";
import { useMemo } from "react";

interface Props {
  onChange: (selectedCompanyId: Companies["id"]) => void;
  textFieldLabel: string;
}

function AutocompleteCompany(props: Props) {
  const { data, error } = useGetCompaniesWithLicensesQuery();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const companies = useMemo(() => data?.companies || [], [data?.companies]);

  return (
    <Autocomplete
      autoHighlight
      id="auto-complete-company"
      options={companies}
      getOptionLabel={(company) => {
        const licenses = company.licenses
          .filter((companyLicense) => !!companyLicense.license_number)
          .map((companyLicense) => companyLicense.license_number)
          .join(", ");
        return `${company.name}${licenses ? " | " : ""}${licenses}`;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.textFieldLabel}
          variant="outlined"
        />
      )}
      onChange={(_event, company) => props.onChange(company?.id || null)}
    />
  );
}

export default AutocompleteCompany;
