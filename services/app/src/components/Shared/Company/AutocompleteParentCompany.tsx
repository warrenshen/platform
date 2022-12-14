import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  ParentCompanyFragment,
  useGetParentCompaniesQuery,
} from "generated/graphql";
import { useMemo } from "react";

interface Props {
  onChange: (selectedCompanyId: ParentCompanyFragment["id"]) => void;
  textFieldLabel: string;
}

function AutocompleteParentCompany(props: Props) {
  const { data, error } = useGetParentCompaniesQuery();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const companies = useMemo(
    () => data?.parent_companies || [],
    [data?.parent_companies]
  );

  return (
    <Autocomplete
      data-cy={"autocomplete-parent-company"}
      autoHighlight
      id="auto-complete-company"
      options={companies}
      getOptionLabel={(company) => {
        return `${company.name}`;
      }}
      renderInput={(params) => (
        <TextField
          data-cy={`${params}`.replace(/\s+/g, "-").toLowerCase()}
          {...params}
          label={props.textFieldLabel}
          variant="outlined"
        />
      )}
      onChange={(_event, company) => props.onChange(company?.id || null)}
    />
  );
}

export default AutocompleteParentCompany;
