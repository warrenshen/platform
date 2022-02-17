import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  DebtFacilityLimitedFragment,
  useGetDebtFacilitiesSubscription,
} from "generated/graphql";
import { useMemo } from "react";

interface Props {
  onChange: (selectedDebtFacility: DebtFacilityLimitedFragment["id"]) => void;
  textFieldLabel: string;
}

function AutocompleteDebtFacility(props: Props) {
  const { data, error } = useGetDebtFacilitiesSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const debtFacilities = useMemo(() => data?.debt_facilities || [], [
    data?.debt_facilities,
  ]);

  return (
    <Autocomplete
      autoHighlight
      id="auto-complete-debt-facility"
      options={debtFacilities}
      getOptionLabel={(debtFacility) => {
        return `${debtFacility.name}`;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.textFieldLabel}
          variant="outlined"
        />
      )}
      onChange={(_event, debtFacility) =>
        props.onChange(debtFacility?.id || null)
      }
    />
  );
}

export default AutocompleteDebtFacility;
