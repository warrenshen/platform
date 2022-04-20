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
  productType?: string | null;
}

function AutocompleteDebtFacility({
  onChange,
  textFieldLabel,
  setupMessage = "",
  productType = null,
}: Props) {
  const { data, error } = useGetDebtFacilitiesSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const debtFacilities = useMemo(() => {
    const facilities = data?.debt_facilities || [];
    return productType && facilities.length > 0
      ? facilities.filter((facility) =>
          !!facility.product_types &&
          facility.product_types.hasOwnProperty("supported")
            ? facility.product_types["supported"].includes(productType)
              ? true
              : false
            : false
        )
      : facilities;
  }, [data?.debt_facilities, productType]);

  return (
    <>
      {debtFacilities.length > 0 ? (
        <Autocomplete
          autoHighlight
          id="auto-complete-debt-facility"
          style={{
            width: 300,
          }}
          options={debtFacilities}
          getOptionLabel={(debtFacility) => {
            return `${debtFacility.name}`;
          }}
          value={debtFacilities.length === 1 ? debtFacilities[0] : null}
          renderInput={(params) => (
            <TextField {...params} label={textFieldLabel} variant="outlined" />
          )}
          onChange={(_event, debtFacility) =>
            onChange(debtFacility?.id || null)
          }
        />
      ) : (
        <></>
      )}
      {!!setupMessage && (
        <Box mt={4}>
          <Alert severity="info">{setupMessage}</Alert>
        </Box>
      )}
    </>
  );
}

export default AutocompleteDebtFacility;
