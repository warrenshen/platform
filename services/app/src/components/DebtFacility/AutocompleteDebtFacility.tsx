import { Box, TextField } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  DebtFacilityFragment,
  useGetDebtFacilitiesSubscription,
} from "generated/graphql";
import { useMemo } from "react";

interface Props {
  onChange: (selectedDebtFacility: DebtFacilityFragment["id"]) => void;
  textFieldLabel: string;
  setupMessage?: string;
  productType?: string;
}

function AutocompleteDebtFacility(props: Props) {
  const { data, error } = useGetDebtFacilitiesSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const debtFacilities = useMemo(() => {
    const facilities = data?.debt_facilities || [];
    return props.productType && facilities.length > 0
      ? facilities.filter((facility) =>
          !!facility.product_types &&
          facility.product_types.hasOwnProperty("supported")
            ? facility.product_types["supported"].includes(props.productType)
              ? true
              : false
            : false
        )
      : facilities;
  }, [data?.debt_facilities, props.productType]);

  return (
    <>
      {debtFacilities.length > 0 ? (
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
      ) : (
        <></>
      )}
      {!!props.setupMessage && (
        <Box mt={4}>
          <Alert severity="info">{props.setupMessage}</Alert>
        </Box>
      )}
    </>
  );
}

export default AutocompleteDebtFacility;
