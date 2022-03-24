import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import GaugeProgressBar from "components/Shared/ProgressBar/GaugeProgressBar";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
} from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { round } from "lodash";

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  currentUsage: number;
  maxCapacity: number;
  facilities: Facilities;
  setSelectedDebtFacilityId: (value: DebtFacilities["id"]) => void;
  setSelectedDebtFacilitySupportedProductTypes: (
    value: ProductTypeEnum[]
  ) => void;
}

function DebtFacilityCapacitySummary({
  currentUsage,
  maxCapacity,
  facilities,
  setSelectedDebtFacilityId,
  setSelectedDebtFacilitySupportedProductTypes,
}: Props) {
  const rawLimitPercent =
    !!maxCapacity && maxCapacity !== 0 ? (100 * currentUsage) / maxCapacity : 0;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  return (
    <Box
      display="flex"
      flexDirection="row"
      height="50px"
      justifyContent="space-between"
    >
      <Box flex="2" flexDirection="row" alignItems="flext-start">
        <Typography variant="h5" color="textSecondary">
          {`${formatCurrency(currentUsage)} / ${formatCurrency(maxCapacity)}`}
        </Typography>
      </Box>
      <Box flex="1" display="flex" flexDirection="row" alignItems="center">
        <FormControl>
          <Autocomplete
            autoHighlight
            id="auto-complete-debt-facility"
            options={facilities}
            getOptionLabel={(debtFacility) => {
              return `${debtFacility.name}`;
            }}
            style={{
              width: 300,
              paddingRight: "50px",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={"Pick debt facility"}
                variant="outlined"
              />
            )}
            onChange={(_event, debtFacility) => {
              setSelectedDebtFacilityId(debtFacility?.id || "");
              const supported_product_types = (debtFacility?.product_types
                ? debtFacility?.product_types["supported"]
                : []) as ProductTypeEnum[];
              setSelectedDebtFacilitySupportedProductTypes(
                supported_product_types
              );
            }}
          />
        </FormControl>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        style={{
          position: "relative",
          top: "-70px",
        }}
      >
        <GaugeProgressBar
          value={roundedLimitPercent}
          valueFontSize={20}
          caption={"Capacity Usage"}
          containerWidth={200}
        />
      </Box>
    </Box>
  );
}

export default DebtFacilityCapacitySummary;
